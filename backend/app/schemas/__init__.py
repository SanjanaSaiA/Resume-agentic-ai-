"""Schemas package"""
from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse
from app.schemas.resume import (
    ResumeGenerateRequest,
    ResumeGenerateResponse,
    CoverLetterGenerateRequest,
    CoverLetterResponse,
    GapAnalysisRequest,
    GapAnalysisResponse
)

__all__ = [
    "UserRegister", "UserLogin", "Token", "UserResponse",
    "ProfileCreate", "ProfileUpdate", "ProfileResponse",
    "ResumeGenerateRequest", "ResumeGenerateResponse",
    "CoverLetterGenerateRequest", "CoverLetterResponse",
    "GapAnalysisRequest", "GapAnalysisResponse"
]
