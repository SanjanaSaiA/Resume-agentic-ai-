"""
Resume and Analysis schemas - Resume generation and skill gap analysis
"""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ResumeGenerateRequest(BaseModel):
    """Resume generation request"""
    job_url: Optional[str] = None
    job_description: Optional[str] = None
    job_title: Optional[str] = None
    company_name: Optional[str] = None


class ResumeGenerateResponse(BaseModel):
    """Resume generation response"""
    id: int
    latex_content: str
    pdf_url: Optional[str] = None
    ats_score: int
    iterations: int
    keywords: List[str]
    optimization_history: List[dict]
    job_title: Optional[str]
    company_name: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class ResumeListResponse(BaseModel):
    """List of user's resumes"""
    id: int
    job_title: Optional[str]
    company_name: Optional[str]
    ats_score: Optional[int]
    iterations: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class CoverLetterGenerateRequest(BaseModel):
    """Cover letter generation request"""
    job_url: Optional[str] = None
    job_description: Optional[str] = None
    job_title: Optional[str] = None
    company_name: Optional[str] = None


class CoverLetterResponse(BaseModel):
    """Cover letter response"""
    id: int
    content: str
    job_title: Optional[str]
    company_name: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class GapAnalysisRequest(BaseModel):
    """Skill gap analysis request"""
    job_url: Optional[str] = None
    job_description: Optional[str] = None
    job_title: Optional[str] = None


class GapAnalysisResponse(BaseModel):
    """Skill gap analysis response"""
    id: int
    job_title: Optional[str]
    matching_skills: List[str]
    missing_skills: List[str]
    priority_gaps: List[dict]
    learning_roadmap: str
    match_percentage: int
    created_at: datetime
    # Additional analysis fields
    strengths: List[dict] = []
    recommendations: List[dict] = []
    certifications_suggested: List[dict] = []
    training_courses: List[dict] = []
    
    class Config:
        from_attributes = True

