"""
Vercel Serverless Function Entry Point (Backend directory deployment)
====================================================================
This file exposes the FastAPI `app` object so that Vercel Serverless Python runtime
can route incoming HTTP requests directly when Root Directory is set to 'backend'.
"""

import sys
import os
from pathlib import Path

# Compute key directory paths
current_file = Path(__file__).resolve()
backend_dir = current_file.parent.parent
parent_dir = backend_dir.parent

# Ensure all relevant paths are in sys.path
for path_to_add in [str(backend_dir), str(parent_dir), str(current_file.parent)]:
    if path_to_add not in sys.path:
        sys.path.insert(0, path_to_add)

try:
    from backend.main import app
except ImportError:
    from main import app
