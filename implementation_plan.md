# CoOperate Saathi — Chrome Extension MVP (Person 1) Implementation Plan

This implementation plan outlines the steps to pivot CoOperate Saathi from a metrics dashboard into a **Chrome Extension-first MVP companion**. The interface will focus entirely on a compact, visual popup layout containing the core developer actions, showcasing **Parcle Memory** integrations and the friendly **Wolf Explorer** mascot.

---

## User Review Required

> [!IMPORTANT]
> **Dashboard to Extension MVP Pivot**
> In alignment with the new requirements, we will focus the entire product inside the Chrome popup. We will remove the large-screen Dashboard tab compilation and build the entire developer workspace (Page Ingestion, Chat Agent, Incident Tracer, and Vault Explorer) directly inside the popup navigation tabs.

> [!NOTE]
> **Vite Bundler Simplification**
> We will modify `vite.config.ts` to build the popup (`index.html`), background script (`background.ts`), and content script (`content.ts`), removing the extra `dashboard.html` entry.

---

## Open Questions

* **Memory Vault Sizing**: Because the popup height is capped at 600px, we will implement a smooth scrollable list for the Memory Vault card items. Do you want custom filter chips (e.g. "All", "ADRs", "Incidents") in this popup vault view, or a simple scrollable archive list? (We propose a simple, compact filter scrollbar to keep navigation fast).

---

## Proposed Changes

We will modify the subproject inside the `extension/` directory.

### 1. Build and Bundling Configuration

#### [MODIFY] [vite.config.ts](file:///d:/saathi/cooperate-saathi/extension/vite.config.ts)
Revert the Rollup input targets to compile only the popup (`index.html`), `background.ts`, and `content.ts`. We will remove `dashboard.html` to align with the extension-first companion MVP.

#### [DELETE] [dashboard.html](file:///d:/saathi/cooperate-saathi/extension/dashboard.html)
Remove the dashboard HTML file from the codebase.

---

### 2. Services & Content Scrapers

#### [MODIFY] [content.ts](file:///d:/saathi/cooperate-saathi/extension/src/content/content.ts)
Update the content scraper to extract and return the MVP fields:
- `title` (document.title)
- `url` (window.location.href)
- `content` (document.body.innerText)

#### [MODIFY] [api.ts](file:///d:/saathi/cooperate-saathi/extension/src/services/api.ts)
Configure the mock database of vault memories to contain the specific mock documents:
- `README.md`
- `Deployment Guide`
- `Auth Architecture`
- `Redis Incident`
- `API Gateway ADR`
Update all fields and response structures to emphasize **Parcle Memory** labels and custom metadata (title, type, date, source).

---

### 3. Layout & Visual Environments

#### [MODIFY] [Layout.tsx](file:///d:/saathi/cooperate-saathi/extension/src/components/layout/Layout.tsx)
- Reconfigure the background canvas particle simulation. It will render a slow-floating environment of:
  - Green particles and dots.
  - Floating knowledge nodes.
  - Transparent documentation icons, code snippet brackets, and tiny bug/error symbols drift upwards in the background.
- Update bottom navigation tabs: Home (`home`), Scan (`capture`), Ask (`ask`), Debug (`search`), Vault (`vault`).

#### [MODIFY] [Header.tsx](file:///d:/saathi/cooperate-saathi/extension/src/components/layout/Header.tsx)
Include the animated `SaathiWolf` explorer mascot, "COOPERATE SAATHI" Orbitron logo, and a "Powered by Parcle" subtitle.

---

### 4. Popup Screen Upgrades

#### [MODIFY] [Home.tsx](file:///d:/saathi/cooperate-saathi/extension/src/popup/Home.tsx)
A playful hero presentation:
- Heading: `🐺 Hi, I'm Saathi.`
- Title: `Your engineering teammate that never forgets.`
- Subtext: `Capture documentation. Recall incidents. Onboard engineers instantly. Powered by Parcle Memory.`
- Three primary action cards:
  1. **Teach Me Documentation**: "Upload READMEs, architecture guides, runbooks and setup documents." Button: `Capture Current Page` (routes to Capture tab).
  2. **Ask Saathi**: "Ask questions about previously captured engineering knowledge." Button: `Ask Question` (routes to Ask tab).
  3. **Debug An Incident**: "Paste an error and search similar incidents from memory." Button: `Search Incident` (routes to Debug tab).

#### [MODIFY] [CapturePage.tsx](file:///d:/saathi/cooperate-saathi/extension/src/popup/CapturePage.tsx)
Shows Active Page details (Title, URL) and custom scanning checklist when clicked:
- `Reading page...`
- `Extracting content...`
- `Saving to Parcle Memory...`
- Renders glowing success block: `✓ Stored in Parcle Memory`.

#### [MODIFY] [AskSaathi.tsx](file:///d:/saathi/cooperate-saathi/extension/src/popup/AskSaathi.tsx)
- Upgrade chat bubbles to use rounded margins (`rounded-[20px]`).
- On submit, show a thinking step log `Searching Parcle Memory...` followed by the response `Memory retrieval will be connected soon.`.

#### [MODIFY] [IncidentSearch.tsx](file:///d:/saathi/cooperate-saathi/extension/src/popup/IncidentSearch.tsx)
- Pasting an error error (Redis timeout, ECONNREFUSED, Deployment failed) returns custom incident post-mortem cards displaying "Source From Parcle", "Confidence Score", "Root Cause", and "Resolution".

#### [NEW] [MemoryVault.tsx](file:///d:/saathi/cooperate-saathi/extension/src/popup/MemoryVault.tsx)
Vault explorer inside the popup. Displays cards: README.md, Deployment Guide, Auth Architecture, Redis Incident, API Gateway ADR. Each card renders title, type badge, date, and source domain.

---

## Verification Plan

### Automated Tests
* Recompile the Vite popup package:
  ```powershell
  cd extension
  npm run build
  ```
  Verify `dist/` contains popup indices (`index.html`, `background.js`, `content.js`) and no warnings are generated.

### Manual Verification
* Deploy the compiled `dist/` pack to Google Chrome.
* Open the popup and verify the explorer wolf mascot floats in the header.
* Verify clicking on the three primary home cards navigates to the respective tabs.
* Test capture page flow, chatbot logs, error searches, and vault scrolling.
