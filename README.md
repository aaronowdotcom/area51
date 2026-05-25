# NexaFlow Sales Kit

Offline-capable desktop sales tool for Windows. Salespeople double-click `start.bat` — the browser opens automatically with a sales dashboard, product catalog, pricing, proposal generator, and demo booking form. No internet required after setup.

---

## Architecture

Three processes run locally on the salesperson's machine:

```
start.bat
  └─ start.ps1 (PowerShell orchestrator)
        ├─ saleskit-service.jar  →  Spring Boot API  :7878
        └─ server.js             →  Next.js UI       :3000
                                                          ↑
                                                    browser opens here
```

**Distribution folder** (`dist/nexaflow-sales-kit-win/`):
```
nexaflow-sales-kit-win/
  start.bat                 ← salesperson double-clicks this
  start.ps1                 ← PowerShell launcher
  setup.ps1                 ← one-time download (node.exe + JDK)
  node.exe                  ← portable Node.js
  server.js                 ← Next.js standalone server
  node_modules/             ← minimal Next.js runtime
  .next/                    ← compiled pages
  public/                   ← static assets
  saleskit-service.jar      ← Spring Boot backend
  jdk/                      ← bundled JDK 21
  content/                  ← editable JSON files (no rebuild needed)
    products.json
    pricing.json
    pipeline.json
```

---

## Developer Setup

### Prerequisites
- Node.js 20+
- Java JDK 21+
- Git Bash (for running `.sh` scripts on Windows)

### 1. Clone and install
```bash
git clone https://github.com/aaronowdotcom/area51.git
cd area51
git checkout claude/practical-ptolemy-bzftM
npm install
```

> `npm install` also installs renderer dependencies automatically via `postinstall`.

### 2. Build
```bash
npm run build
```
This runs:
- `npm run build:renderer` — compiles Next.js into standalone output
- `npm run build:java` — packages Spring Boot into `saleskit-service.jar`

> First build downloads Maven automatically (~10 MB). Subsequent builds are faster.

### 3. Assemble distribution
```bash
sh scripts/package.sh
```
Produces:
- `dist/nexaflow-sales-kit-win/` — Windows distribution
- `dist/nexaflow-sales-kit-unix/` — Linux / macOS distribution (optional)

### 4. Development mode
```bash
bash scripts/dev.sh
```
Starts the Java service (SIT profile) and Next.js dev server with hot reload at `http://localhost:3000`.

---

## Salesperson Setup (Windows — one time)

1. Copy the `nexaflow-sales-kit-win/` folder to the laptop.
2. Right-click `setup.ps1` → **Run with PowerShell**.
   - Downloads `node.exe` (~35 MB) and JDK 21 (~180 MB) into the folder.
   - Internet required for this step only.

---

## Daily Usage (Salesperson)

1. Double-click **`start.bat`**.
2. A terminal window titled *NexaFlow Sales Kit* opens.
3. Browser opens automatically to `http://localhost:3000`.
4. To stop: **click X** on the terminal window — all services shut down cleanly.

---

## Updating Content (No Rebuild Required)

Edit the JSON files in `content/` with any text editor. Changes take effect on the next browser page load.

| File | What it controls |
|---|---|
| `content/products.json` | Product catalog cards |
| `content/pricing.json` | Pricing plans and add-ons |
| `content/pipeline.json` | Dashboard pipeline table |

To push a content update to salespeople: zip the `content/` folder and ask them to replace it — no new binary needed.

---

## Environment Profiles

The Spring Boot backend supports three profiles. Set `$profile` in `start.ps1` to switch.

| Profile | Usage | Logging |
|---|---|---|
| `sit` | System integration testing | DEBUG |
| `uat` | User acceptance testing | INFO |
| `prod` | Production (default) | WARN / ERROR |

Config files: `java-service/src/main/resources/application-{sit,uat,prod}.properties`

---

## Project Structure

```
area51/
  start.bat                         ← Windows entry point
  start.ps1                         ← PowerShell launcher
  launcher.js                       ← Unix/macOS entry point (pkg)
  content/                          ← editable sales content (JSON)
  renderer/                         ← Next.js frontend
    pages/
      index.js                      ← Dashboard
      catalog.js                    ← Product catalog
      pricing.js                    ← Pricing
      proposals.js                  ← Proposal generator
      contact.js                    ← Book a demo
    components/
      Layout.js, Sidebar.js
  java-service/                     ← Spring Boot backend
    src/main/java/saleskit/
      SalesKitApplication.java
      config/CorsConfig.java
      controller/
        HealthController.java       ← GET  /health
        ProposalController.java     ← POST /api/proposal
        ExportController.java       ← GET  /api/export/csv
    src/main/resources/
      application.properties
      application-sit.properties
      application-uat.properties
      application-prod.properties
  scripts/
    build-java.sh                   ← compile Spring Boot JAR
    package.sh                      ← assemble distribution folders
    download-jdk.sh                 ← download JDK (Linux/macOS)
    setup-win.ps1                   ← download node.exe + JDK (Windows)
    dev.sh                          ← start dev environment
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Execution policy error on `.ps1` | Right-click → Run with PowerShell, or run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` in admin PowerShell |
| `node` not recognised | Re-run `setup.ps1` to download `node.exe` |
| `java` not recognised | Re-run `setup.ps1` to download JDK, or check `jdk/` folder exists |
| Server did not respond in time | Check `server.js` exists in the distribution folder; rebuild if missing |
| Blank page or 404 in browser | The `.next/` folder is missing; re-run `sh scripts/package.sh` |
| Port 3000 or 7878 already in use | Change `$nextPort` / `$javaPort` in `start.ps1` and `server.port` in the matching `application-*.properties` |
| Content changes not showing | Hard-refresh browser with Ctrl+Shift+R |

---

## Documentation

Full setup and operations guide: [`NexaFlow-SalesKit-Guide.docx`](./NexaFlow-SalesKit-Guide.docx)
