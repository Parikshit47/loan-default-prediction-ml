"""
Vercel Serverless Function Entry Point
======================================
This file exposes the FastAPI `app` object so that Vercel Serverless Python runtime
can route incoming HTTP requests directly to FastAPI routes and OpenAPI documentation.
"""

import sys
import os
from pathlib import Path

# Compute key directory paths
current_file = Path(__file__).resolve()
project_root = current_file.parent.parent
backend_dir = project_root / "backend"

# Ensure all relevant paths are in sys.path
for path_to_add in [str(backend_dir), str(project_root), str(current_file.parent)]:
    if path_to_add not in sys.path:
        sys.path.insert(0, path_to_add)

try:
    from backend.main import app
except ImportError:
    from main import app
