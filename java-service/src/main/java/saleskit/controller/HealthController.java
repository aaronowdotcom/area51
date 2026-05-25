package saleskit.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {

    @Value("${app.version}")
    private String version;

    @Value("${app.environment}")
    private String environment;

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of(
            "status",      "ok",
            "service",     "saleskit-java",
            "version",     version,
            "environment", environment
        );
    }
}
