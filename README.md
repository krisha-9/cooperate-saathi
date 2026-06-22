# CoOperate Saathi — AI-Powered Engineering Memory Agent

CoOperate Saathi is a Chrome Extension-first MVP companion designed to help developers capture documentation, recall troubleshooting post-mortems, and leverage shared engineering knowledge directly from their browser. It interfaces with a FastAPI backend at `http://localhost:8000` while utilizing a hybrid local-fallback architecture for ultimate reliability.

---

## 🐺 Features

1. **Capture Knowledge**: Scrape active tab details (title, URL, and page contents) and store them in the local **Parcle Memory** vault. Automatically syncs to the FastAPI backend, falling back gracefully if the backend is offline.
2. **Ask Saathi (Chat)**: A multi-step agent companion chat panel that answers queries using ingested engineering documentation. Shows real-time thinking states and references sources used.
3. **Incident Recall**: Query error messages, logs, or stack traces (e.g. `ECONNREFUSED`, `Redis timeout`) to view matching post-mortem reports complete with:
   - Match confidence dial
   - Root Cause
   - Resolution
   - Context URL & metadata
4. **Store Incident**: Instantly save new incident post-mortems to the memory graph. The FastAPI backend analyzes the incident and returns structured Root Cause/Resolution details to display.
5. **Backend Status Indicator**: Live connection status chip in settings (`🟢 Backend Connected` or `🔴 Backend Offline`) powered by a lightweight 5-second polling status checker.
6. **Demo Safety Mode**: Fully functional local-fallback modes for all AI features when the backend is offline.

---

## 🛠️ Architecture

CoOperate Saathi uses a **Hybrid Architecture** where `chrome.storage.local` serves as the primary source of truth for the local UI client, while the FastAPI backend provides AI reasoning capabilities.

```
                  ┌──────────────────────┐
                  │   Chrome Extension   │
                  │  (React + Vite + TS) │
                  └──────────┬───────────┘
                             │
                             ├───────────────┐ (Sync / AI calls)
                             ▼               ▼
                   ┌──────────────────┐    ┌──────────────────┐
                   │  chrome.storage  │    │  FastAPI Backend │
                   │  (Local Vault)   │    │ (localhost:8000) │
                   └──────────────────┘    └──────────────────┘
```

---

## Quickstart & Setup

### 1. Prerequisites
- **Node.js**: v18 or later
- **Python**: v3.10 or later

### 2. Extension Installation
Navigate to the `extension` subdirectory:
```bash
cd extension
npm install
npm run build
```

To load the extension in Google Chrome:
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (top right toggle).
3. Click **Load unpacked** (top left button) and select the `extension/dist` folder.

### 3. Running Development Servers
- **Extension**:
  ```bash
  cd extension
  npm run dev
  ```
- **Backend (FastAPI)**:
  Make sure your FastAPI server is configured and running:
  ```bash
  cd backend
  uvicorn main:app --reload
  ```
  *(Default base URL: `http://localhost:8000`)*

---

## Directory Structure

- `extension/` — Chrome companion extension source code, popup tabs, and components.
- `backend/` — FastAPI backend code, agent modules, and schema definitions.
- `docs/` — Architecture design records, guidelines, and reference guides.   

Here's the link of our project:
https://youtube.com/shorts/_m40J3HhX30?feature=share
