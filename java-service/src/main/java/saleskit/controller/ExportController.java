package saleskit.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/export")
public class ExportController {

    @GetMapping("/csv")
    public ResponseEntity<String> exportCsv() {
        String csv = "Company,Stage,Value,Owner,Days In Stage\n"
                + "Acme Corp,Proposal,$120000,Sales Rep,12\n"
                + "GlobalTech Ltd,Demo,$85000,Sales Rep,5\n"
                + "Veritas Systems,Negotiation,$220000,Sales Rep,28\n"
                + "BrightPath Inc,Discovery,$45000,Sales Rep,3\n"
                + "Meridian Group,Closed Won,$175000,Sales Rep,0\n";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"pipeline.csv\"")
                .header(HttpHeaders.CONTENT_TYPE, "text/csv")
                .body(csv);
    }
}
