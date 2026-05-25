package saleskit;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.Headers;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.Executors;

public class SalesKitServer {

    public static void main(String[] args) throws Exception {
        int port = 7878;
        for (int i = 0; i < args.length - 1; i++) {
            if ("--port".equals(args[i])) {
                port = Integer.parseInt(args[i + 1]);
            }
        }

        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/health", new HealthHandler());
        server.createContext("/api/proposal", new ProposalHandler());
        server.createContext("/api/export/csv", new CsvExportHandler());
        server.setExecutor(Executors.newFixedThreadPool(4));
        server.start();

        System.out.println("[SalesKit] Java service started on port " + port);
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            server.stop(0);
            System.out.println("[SalesKit] Stopped.");
        }));
    }

    static void sendResponse(HttpExchange ex, int code, String contentType, String body) throws IOException {
        Headers headers = ex.getResponseHeaders();
        headers.set("Content-Type", contentType);
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        headers.set("Access-Control-Allow-Headers", "Content-Type");

        if ("OPTIONS".equalsIgnoreCase(ex.getRequestMethod())) {
            ex.sendResponseHeaders(204, -1);
            ex.close();
            return;
        }

        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        ex.sendResponseHeaders(code, bytes.length);
        try (OutputStream os = ex.getResponseBody()) {
            os.write(bytes);
        }
    }

    static String readBody(HttpExchange ex) throws IOException {
        try (InputStream is = ex.getRequestBody();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            byte[] buf = new byte[4096];
            int n;
            while ((n = is.read(buf)) != -1) baos.write(buf, 0, n);
            return baos.toString(StandardCharsets.UTF_8);
        }
    }

    // Simple JSON value extractor (no external deps)
    static String jsonGet(String json, String key) {
        String search = "\"" + key + "\"";
        int idx = json.indexOf(search);
        if (idx < 0) return "";
        idx = json.indexOf(":", idx + search.length());
        if (idx < 0) return "";
        idx++;
        while (idx < json.length() && Character.isWhitespace(json.charAt(idx))) idx++;
        if (idx >= json.length()) return "";
        if (json.charAt(idx) == '"') {
            int end = json.indexOf('"', idx + 1);
            return end > 0 ? json.substring(idx + 1, end) : "";
        }
        int end = idx;
        while (end < json.length() && json.charAt(end) != ',' && json.charAt(end) != '}') end++;
        return json.substring(idx, end).trim();
    }

    // --- Handlers ---

    static class HealthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange ex) throws IOException {
            sendResponse(ex, 200, "application/json",
                    "{\"status\":\"ok\",\"service\":\"saleskit-java\",\"version\":\"1.0.0\"}");
        }
    }

    static class ProposalHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange ex) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(ex.getRequestMethod())) {
                sendResponse(ex, 204, "text/plain", "");
                return;
            }

            String body = readBody(ex);

            String clientName    = jsonGet(body, "clientName");
            String clientCompany = jsonGet(body, "clientCompany");
            String clientTitle   = jsonGet(body, "clientTitle");
            String product       = jsonGet(body, "product");
            String seats         = jsonGet(body, "seats");
            String term          = jsonGet(body, "term");
            String discount      = jsonGet(body, "discount");
            String notes         = jsonGet(body, "notes");
            String total         = jsonGet(body, "total");
            String subtotal      = jsonGet(body, "subtotal");
            String monthly       = jsonGet(body, "monthly");
            String discountAmt   = jsonGet(body, "discountAmt");

            String date = LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM d, yyyy"));

            String discountRow = discountAmt != null && !discountAmt.equals("0") && !discountAmt.isBlank()
                ? "<tr><td colspan='4'>Discount (" + discount + "%)</td>"
                  + "<td style='text-align:right;color:#16a34a'>−$" + fmt(discountAmt) + "</td></tr>"
                : "";

            String notesSection = (notes != null && !notes.isBlank())
                ? "<div class='section'><h2>Notes &amp; Scope</h2>"
                  + "<div class='notes'>" + escHtml(notes) + "</div></div>"
                : "";

            String html = "<!DOCTYPE html><html><head><meta charset='utf-8'>"
                + "<title>NexaFlow Proposal — " + escHtml(clientCompany) + "</title>"
                + PROPOSAL_STYLES
                + "</head><body>"
                + "<div class='header'>"
                + "<h1>Sales Proposal</h1>"
                + "<p>Prepared for " + escHtml(clientCompany) + " &middot; " + date + "</p>"
                + "</div>"
                + "<div class='body'>"
                + "<div class='section'><h2>Prepared For</h2>"
                + "<div class='info-grid'>"
                + "<div class='info-item'><label>Contact</label><span>" + escHtml(clientName) + "</span></div>"
                + "<div class='info-item'><label>Title</label><span>" + escHtml(clientTitle) + "</span></div>"
                + "<div class='info-item'><label>Company</label><span>" + escHtml(clientCompany) + "</span></div>"
                + "<div class='info-item'><label>Proposal Date</label><span>" + date + "</span></div>"
                + "</div></div>"
                + "<div class='section'><h2>Proposed Solution</h2>"
                + "<table>"
                + "<tr><th>Product</th><th>Seats</th><th>Term</th><th style='text-align:right'>Monthly</th><th style='text-align:right'>Subtotal</th></tr>"
                + "<tr><td>" + escHtml(product) + "</td><td>" + escHtml(seats) + "</td><td>" + escHtml(term) + " months</td>"
                + "<td style='text-align:right'>$" + fmt(monthly) + "/mo</td>"
                + "<td style='text-align:right'>$" + fmt(subtotal) + "</td></tr>"
                + discountRow
                + "<tr class='total-row'><td colspan='4'>Total Contract Value</td><td style='text-align:right'>$" + fmt(total) + "</td></tr>"
                + "</table></div>"
                + notesSection
                + "<div class='footer'>"
                + "<p>This proposal is valid for 30 days. Prices are in USD.</p>"
                + "<p>NexaFlow Inc. &middot; sales@nexaflow.io &middot; nexaflow.io</p>"
                + "</div></div></body></html>";

            // Escape the HTML for JSON embedding
            String jsonEscaped = html.replace("\\", "\\\\").replace("\"", "\\\"")
                    .replace("\n", "\\n").replace("\r", "");

            sendResponse(ex, 200, "application/json",
                    "{\"html\":\"" + jsonEscaped + "\",\"generatedBy\":\"java-service\"}");
        }

        private String fmt(String num) {
            try {
                double d = Double.parseDouble(num);
                return String.format("%,.0f", d);
            } catch (NumberFormatException e) {
                return num;
            }
        }

        private String escHtml(String s) {
            if (s == null) return "";
            return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
        }

        private static final String PROPOSAL_STYLES = "<style>"
                + "* { margin: 0; padding: 0; box-sizing: border-box; }"
                + "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; }"
                + ".header { background: #1d4ed8; color: white; padding: 40px 48px; }"
                + ".header h1 { font-size: 28px; font-weight: 800; }"
                + ".header p { font-size: 14px; opacity: 0.8; margin-top: 4px; }"
                + ".body { padding: 48px; }"
                + ".section { margin-bottom: 36px; }"
                + ".section h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 12px; }"
                + ".info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }"
                + ".info-item label { font-size: 12px; color: #94a3b8; display: block; }"
                + ".info-item span { font-size: 15px; font-weight: 600; color: #0f172a; }"
                + "table { width: 100%; border-collapse: collapse; }"
                + "th { text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; border-bottom: 2px solid #e2e8f0; padding: 10px 12px; }"
                + "td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }"
                + ".total-row td { font-weight: 700; font-size: 16px; color: #1d4ed8; border-top: 2px solid #e2e8f0; border-bottom: none; }"
                + ".footer { margin-top: 60px; padding-top: 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }"
                + ".notes { background: #f8fafc; border-left: 3px solid #2563eb; padding: 16px; border-radius: 0 8px 8px 0; font-size: 14px; color: #334155; }"
                + "</style>";
    }

    static class CsvExportHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange ex) throws IOException {
            StringBuilder csv = new StringBuilder();
            csv.append("Company,Stage,Value,Owner,Days In Stage\n");
            String[][] pipeline = {
                {"Acme Corp", "Proposal", "$120000", "Sales Rep", "12"},
                {"GlobalTech Ltd", "Demo", "$85000", "Sales Rep", "5"},
                {"Veritas Systems", "Negotiation", "$220000", "Sales Rep", "28"},
                {"BrightPath Inc", "Discovery", "$45000", "Sales Rep", "3"},
                {"Meridian Group", "Closed Won", "$175000", "Sales Rep", "0"},
            };
            for (String[] row : pipeline) {
                csv.append(String.join(",", row)).append("\n");
            }

            ex.getResponseHeaders().set("Content-Disposition", "attachment; filename=\"pipeline.csv\"");
            sendResponse(ex, 200, "text/csv", csv.toString());
        }
    }
}
