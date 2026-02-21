import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis_router)
