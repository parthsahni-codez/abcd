from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="TrendPilot AI API",
    description="Backend API for TrendPilot AI Social Media Agent",
    version="1.0.0"
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to TrendPilot AI API"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Include routers
from .api.endpoints import router as api_router
app.include_router(api_router, prefix="/api/v1")
