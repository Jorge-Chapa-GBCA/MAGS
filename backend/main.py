import logging
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from backend.services.reference_loader import load_references
from backend.routers.analysis import router as analysis_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: load reference documents
    logger.info("Loading reference documents...")
    refs = load_references()
    logger.info(f"Startup complete. {len(refs)} reference docs loaded.")
    yield
    # Shutdown
    logger.info("Shutting down MAGS backend.")


app = FastAPI(
    title="MAGS Backend",
    description="Machine-Assisted Green Star — backend API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis_router)

# Serve built frontend in production (when frontend/dist exists)
_frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
if _frontend_dist.is_dir():
    logger.info(f"Serving frontend from {_frontend_dist}")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = (_frontend_dist / full_path).resolve()
        if file_path.is_file() and str(file_path).startswith(str(_frontend_dist.resolve())):
            return FileResponse(str(file_path))
        return FileResponse(str(_frontend_dist / "index.html"))
