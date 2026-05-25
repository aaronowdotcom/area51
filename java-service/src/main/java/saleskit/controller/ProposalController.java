package saleskit.controller;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProposalController {

    @PostMapping("/proposal")
    public Map<String, String> generate(@RequestBody Map<String, Object> body) {
        String clientName    = str(body, "clientName");
        String clientCompany = str(body, "clientCompany");
        String clientTitle   = str(body, "clientTitle");
        String product       = str(body, "product");
        String seats         = str(body, "seats");
        String term          = str(body, "term");
        String discount      = str(body, "discount");
        String notes         = str(body, "notes");
        String total         = str(body, "total");
        String subtotal      = str(body, "subtotal");
        String monthly       = str(body, "monthly");
        String discountAmt   = str(body, "discountAmt");

        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM d, yyyy"));
        String html = buildHtml(clientName, clientCompany, clientTitle,
                product, seats, term, discount, notes,
                total, subtotal, monthly, discountAmt, date);

        return Map.of("html", html, "generatedBy", "spring-boot-service");
    }

    private String str(Map<String, Object> map, String key) {
        Object v = map.get(key);
        return v != null ? v.toString() : "";
    }

    private String esc(String s) {
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }

    private String fmt(String num) {
        try { return String.format("%,.0f", Double.parseDouble(num)); }
        catch (NumberFormatException e) { return num; }
    }

    private String buildHtml(String clientName, String clientCompany, String clientTitle,
                             String product, String seats, String term, String discount,
                             String notes, String total, String subtotal,
                             String monthly, String discountAmt, String date) {

        String discountRow = !discountAmt.isBlank() && !discountAmt.equals("0")
                ? "<tr><td colspan='4'>Discount (" + esc(discount) + "%)</td>"
                  + "<td style='text-align:right;color:#16a34a'>−$" + fmt(discountAmt) + "</td></tr>"
                : "";

        String notesSection = !notes.isBlank()
                ? "<div class='section'><h2>Notes &amp; Scope</h2>"
                  + "<div class='notes'>" + esc(notes) + "</div></div>"
                : "";

        return "<!DOCTYPE html><html><head><meta charset='utf-8'>"
                + "<title>NexaFlow Proposal — " + esc(clientCompany) + "</title>"
                + STYLES
                + "</head><body>"
                + "<div class='header'>"
                + "<h1>Sales Proposal</h1>"
                + "<p>Prepared for " + esc(clientCompany) + " &middot; " + date + "</p>"
                + "</div>"
                + "<div class='body'>"
                + "<div class='section'><h2>Prepared For</h2>"
                + "<div class='info-grid'>"
                + "<div class='info-item'><label>Contact</label><span>" + esc(clientName)    + "</span></div>"
                + "<div class='info-item'><label>Title</label><span>"   + esc(clientTitle)   + "</span></div>"
                + "<div class='info-item'><label>Company</label><span>" + esc(clientCompany) + "</span></div>"
                + "<div class='info-item'><label>Date</label><span>"    + date               + "</span></div>"
                + "</div></div>"
                + "<div class='section'><h2>Proposed Solution</h2><table>"
                + "<tr><th>Product</th><th>Seats</th><th>Term</th>"
                + "<th style='text-align:right'>Monthly</th><th style='text-align:right'>Subtotal</th></tr>"
                + "<tr>"
                + "<td>" + esc(product) + "</td>"
                + "<td>" + esc(seats)   + "</td>"
                + "<td>" + esc(term)    + " months</td>"
                + "<td style='text-align:right'>$" + fmt(monthly)  + "/mo</td>"
                + "<td style='text-align:right'>$" + fmt(subtotal) + "</td>"
                + "</tr>"
                + discountRow
                + "<tr class='total-row'><td colspan='4'>Total Contract Value</td>"
                + "<td style='text-align:right'>$" + fmt(total) + "</td></tr>"
                + "</table></div>"
                + notesSection
                + "<div class='footer'>"
                + "<p>This proposal is valid for 30 days. Prices are in USD.</p>"
                + "<p>NexaFlow Inc. &middot; sales@nexaflow.io &middot; nexaflow.io</p>"
                + "</div></div></body></html>";
    }

    private static final String STYLES = "<style>"
            + "* { margin:0; padding:0; box-sizing:border-box; }"
            + "body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; color:#1e293b; }"
            + ".header { background:#1d4ed8; color:white; padding:40px 48px; }"
            + ".header h1 { font-size:28px; font-weight:800; }"
            + ".header p  { font-size:14px; opacity:.8; margin-top:4px; }"
            + ".body { padding:48px; }"
            + ".section { margin-bottom:36px; }"
            + ".section h2 { font-size:13px; text-transform:uppercase; letter-spacing:.08em; color:#64748b; margin-bottom:12px; }"
            + ".info-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }"
            + ".info-item label { font-size:12px; color:#94a3b8; display:block; }"
            + ".info-item span  { font-size:15px; font-weight:600; color:#0f172a; }"
            + "table { width:100%; border-collapse:collapse; }"
            + "th { text-align:left; font-size:12px; text-transform:uppercase; letter-spacing:.06em; color:#64748b; border-bottom:2px solid #e2e8f0; padding:10px 12px; }"
            + "td { padding:12px; border-bottom:1px solid #f1f5f9; font-size:14px; }"
            + ".total-row td { font-weight:700; font-size:16px; color:#1d4ed8; border-top:2px solid #e2e8f0; border-bottom:none; }"
            + ".footer { margin-top:60px; padding-top:24px; border-top:1px solid #e2e8f0; font-size:12px; color:#94a3b8; }"
            + ".notes { background:#f8fafc; border-left:3px solid #2563eb; padding:16px; border-radius:0 8px 8px 0; font-size:14px; color:#334155; }"
            + "</style>";
}
