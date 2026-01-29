"""
Application Configuration
Loads environment variables and provides settings
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/resumeai"
    
    # JWT Authentication
    JWT_SECRET: str = "your-super-secret-jwt-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # AI API Keys
    GEMINI_API_KEY: str = ""  # Primary
    GROQ_API_KEY: str = ""  # Backup
    OPENAI_API_KEY: str = ""  # Backup
    XAI_API_KEY: str = ""  # Backup
    HUGGINGFACE_MODEL: str = "google/gemma-2b-it"
    
    # Google ADK (optional)
    GOOGLE_ADK_API_KEY: Optional[str] = None
    
    # ATS Optimization
    ATS_TARGET_SCORE: int = 85
    MAX_OPTIMIZATION_ITERATIONS: int = 5
    
    # File Storage
    LATEX_TEMPLATE_DIR: str = "templates"
    PDF_OUTPUT_DIR: str = "output/pdfs"
    
    # CORS
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:3001"]
    
    # Application
    APP_NAME: str = "ResumeAI"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
