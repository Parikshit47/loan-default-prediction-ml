# Universal Full-Stack Deployment Guide: FastAPI Backend + React Frontend on Vercel

> **Purpose**: A generic, reusable architectural blueprint for deploying any Monorepo containing a **Python FastAPI backend** and a **React (Vite/CRA) frontend** to Vercel as two decoupled, independently scalable services.
>
> Hand this guide to any developer or LLM to configure deployments without trial-and-error.

---

## 1. Universal Monorepo Architecture

When deploying a full-stack project from a single Git repository to Vercel, treat the codebase as **two distinct micro-projects**:

```
<project-root>/
│
├── <backend-directory>/               ---> [Vercel Project 1: Python Serverless API]
│   ├── main.py                        ---> App entrypoint (exposes `app = FastAPI()`)
│   ├── requirements.txt               ---> Python serverless dependencies
│   ├── vercel.json                    ---> Compiles Python runtime & routes traffic
│   ├── .vercelignore                  ---> Excludes large assets, virtualenvs, datasets
│   └── <data-or-models>/              ---> Localized artifacts (ML models, sqlite, etc.)
│
└── <frontend-directory>/              ---> [Vercel Project 2: React SPA Client]
    ├── src/
    │   └── config.js                  ---> Central API URL resolver with env fallback
    ├── vercel.json                    ---> Single-Page Application (SPA) routing rule
    ├── .env.production                ---> Production environment variable definitions
    └── package.json                   ---> Scripts (`build`, `preview`) & dependencies
```

---

## 2. Universal Failure Modes & Solutions

Every FastAPI + React deployment on Vercel encounters the same five pitfalls if unconfigured. Use this decision matrix:

| Failure Symptom | Underlying Cause | Universal Fix |
| :--- | :--- | :--- |
| **`404 NOT_FOUND`** | Vercel has no routing rule mapping web traffic to the Python ASGI handler. | Add `vercel.json` with route rewrite rules mapping `/(.*)` to `main.py`. |
| **Browser downloads `.py` file** | When framework is `Other`, Vercel defaults to static hosting and serves `.py` files as raw text downloads. | Add explicit `"use": "@vercel/python"` builder in `<backend>/vercel.json`. |
| **`ModuleNotFoundError` / `ImportError`** | In AWS Lambda/Vercel containers, `sys.path` does not include subdirectories by default. | Inject `_current_dir` and parent directories into `sys.path` at top of `main.py`. |
| **`FileNotFoundError` (Assets/Models)** | Assets stored outside the backend root are omitted during Vercel's packaging step. | Move all needed files inside `<backend-directory>/` and use dynamic path discovery. |
| **`CORS Error` in Browser** | Backend blocks requests from the new production frontend domain. | Configure FastAPI `CORSMiddleware` with `allow_origins=["*"]` or dynamic env origins. |
| **Frontend 404 on page refresh** | Client-side routers (React Router) need deep links like `/dashboard` routed via `/index.html`. | Add SPA rewrite rule in `<frontend>/vercel.json`. |
| **Build Timeout / Size Limit Exceeded** | Vercel functions have strict bundle limits (50MB zipped / 250MB uncompressed). | Add `.vercelignore` to exclude datasets, raw notebooks, tests, and `venv/`. |

---

## 3. Backend Configuration Blueprint (`<backend-directory>/`)

### A. `<backend-directory>/vercel.json`
Forces Vercel's build engine to invoke `@vercel/python` and direct all incoming HTTP traffic to the FastAPI application:

```json
{
  "builds": [
    {
      "src": "main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "main.py"
    }
  ]
}
```
*(Replace `main.py` if your entry file is named differently, e.g., `app.py` or `api/index.py`)*

---

### B. `<backend-directory>/main.py` (Resilient Entrypoint)
Add this boilerplate at the **very top** of your FastAPI entrypoint before any local module imports:

```python
import sys
import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ------------------------------------------------------------------------------
# 1. DYNAMIC SYS.PATH INJECTION (Fixes serverless import errors)
# ------------------------------------------------------------------------------
_current_dir = Path(__file__).resolve().parent
if str(_current_dir) not in sys.path:
    sys.path.insert(0, str(_current_dir))
if str(_current_dir.parent) not in sys.path:
    sys.path.insert(0, str(_current_dir.parent))

# ------------------------------------------------------------------------------
# 2. RESILIENT LOCAL MODULE IMPORTS (Dual fallback for package & direct execution)
# ------------------------------------------------------------------------------
try:
    from schemas import *
except ImportError:
    # Fallback if imported from parent directory
    pass

# ------------------------------------------------------------------------------
# 3. INITIALIZE APP & CORS
# ------------------------------------------------------------------------------
app = FastAPI(
    title="Application API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for local dev and production frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify [os.getenv("FRONTEND_URL", "*")]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "online", "docs": "/docs"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
```

---

### C. Universal Dynamic Asset/Model Locator
If your backend loads `.pkl`, `.onnx`, `.json`, or `.db` files, **never hardcode absolute or shallow relative paths**. Use this multi-fallback locator:

```python
def resolve_asset_path(filename: str) -> Path:
    """
    Searches multiple candidate locations to locate data/model assets
    reliably across local dev, Docker, tests, and Vercel serverless containers.
    """
    current_dir = Path(__file__).resolve().parent
    candidates = [
        current_dir / filename,
        current_dir / "saved_models" / filename,
        current_dir / "assets" / filename,
        current_dir.parent / filename,
        Path.cwd() / filename,
        Path.cwd() / "<backend-directory>" / filename,
    ]
    for candidate in candidates:
        if candidate.is_file():
            return candidate
            
    # Default fallback path
    return current_dir / filename
```

---

### D. `<backend-directory>/requirements.txt`
Keep dependencies clean and omit optional binary extras that compile C-extensions unless wheels exist:

```text
fastapi>=0.110.0
uvicorn>=0.28.0
pydantic>=2.6.0
# Add your specific packages below:
# scikit-learn>=1.4.0
# pandas>=2.2.0
# numpy>=1.26.0
# joblib>=1.3.0
```
> ⚠️ **Warning**: Do not use `uvicorn[standard]` on serverless because `uvloop` often fails to compile in standard Linux lambda environments.

---

### E. `<project-root>/.vercelignore` & `<backend-directory>/.vercelignore`
Prevents exceeding Vercel's serverless function payload limit (50MB zipped):

```text
venv/
.venv/
env/
__pycache__/
*.pyc
.pytest_cache/
*.ipynb
.ipynb_checkpoints/
data/
raw_data/
*.csv
*.pdf
node_modules/
frontend/
.git/
```

---

## 4. Frontend Configuration Blueprint (`<frontend-directory>/`)

### A. `<frontend-directory>/vercel.json` (SPA Client Routing)
Prevents 404 errors when users refresh deep URLs like `/dashboard` or `/profile`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

### B. `<frontend-directory>/src/config.js` (Centralized API Client)
Never hardcode `http://localhost:8000` inside components. Create a single config module:

```javascript
/**
 * Resolves the API Base URL dynamically:
 * 1. Checks Vercel Environment Variable (VITE_API_BASE_URL)
 * 2. Falls back to local dev URL (http://localhost:8000)
 */
export const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
```
*(For Create-React-App, replace `import.meta.env.VITE_API_BASE_URL` with `process.env.REACT_APP_API_BASE_URL`)*

---

### C. `<frontend-directory>/.env.production`
```text
VITE_API_BASE_URL=https://<your-backend-project-name>.vercel.app
```

---

## 5. Step-by-Step Vercel Provisioning Guide

Follow this sequence for **any** repository:

### Step 1: Deploy the Backend API
1. Open [Vercel Dashboard](https://vercel.com/dashboard) → **Add New...** → **Project**.
2. Select your Git repository.
3. Configure settings:
   - **Project Name**: `<custom-backend-name>` (e.g., `my-app-api`)
   - **Framework Preset**: `Other`
   - **Root Directory**: Select `<backend-directory>` (e.g., `backend` or `server`)
   - **Build & Output Settings**: Leave empty / default.
4. Click **Deploy**.
5. Copy your assigned production URL: `https://<custom-backend-name>.vercel.app`.
6. Verify in browser:
   - `https://<custom-backend-name>.vercel.app/docs` (Swagger UI)
   - `https://<custom-backend-name>.vercel.app/api/health`

---

### Step 2: Deploy the Frontend Client
1. Back in [Vercel Dashboard](https://vercel.com/dashboard) → **Add New...** → **Project**.
2. Select the **same** Git repository.
3. Configure settings:
   - **Project Name**: `<custom-frontend-name>` (e.g., `my-app-web`)
   - **Framework Preset**: `Vite` (or `Create React App`)
   - **Root Directory**: Select `<frontend-directory>` (e.g., `frontend` or `client`)
4. Expand **Environment Variables**:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://<custom-backend-name>.vercel.app` *(no trailing slash)*
5. Click **Deploy**.

---

## 6. Standard Directive Prompt for Other LLMs

Copy-paste this prompt whenever asking an AI assistant to prepare a FastAPI + React Monorepo for Vercel deployment:

```text
Please configure this full-stack Monorepo for independent deployment to Vercel (FastAPI backend and React frontend):

1. Backend Requirements:
   - Place a vercel.json in the backend directory using "@vercel/python" builder on the main entry file with route rewrites.
   - Ensure main.py dynamically injects directory paths into sys.path to prevent serverless import failures.
   - Configure CORSMiddleware to accept incoming requests from frontend origins.
   - Ensure all model/data artifacts are located inside the backend directory and loaded using dynamic fallback path resolution.
   - Create a .vercelignore excluding heavy datasets, notebooks, and virtual environments.

2. Frontend Requirements:
   - Place a vercel.json in the frontend directory with SPA rewrite rules to /index.html.
   - Centralize API calls through a config.js using `import.meta.env.VITE_API_BASE_URL`.
   - Create .env and .env.production files.

Do not use hardcoded local URLs in React components.
```
