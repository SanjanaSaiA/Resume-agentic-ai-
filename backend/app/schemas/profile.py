"""
Profile schemas - User profile data validation
"""
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


class Education(BaseModel):
    """Education entry"""
    degree: str
    field: Optional[str] = None
    university: str
    location: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    gpa: Optional[float] = None
    achievements: List[str] = []


class Experience(BaseModel):
    """Work experience entry"""
    title: str
    company: str
    location: Optional[str] = None
    start_date: str
    end_date: Optional[str] = None
    is_current: bool = False
    achievements: List[str] = []
    technologies: List[str] = []


class Project(BaseModel):
    """Project entry"""
    name: str
    description: str
    technologies: List[str] = []
    link: Optional[str] = None
    github: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class Certification(BaseModel):
    """Certification entry"""
    name: str
    issuer: str
    date: Optional[str] = None
    expiry_date: Optional[str] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None


class ProfileCreate(BaseModel):
    """Create profile request"""
    full_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    skills: List[str] = []
    education: List[Education] = []
    experience: List[Experience] = []
    projects: List[Project] = []
    certifications: List[Certification] = []


class ProfileUpdate(BaseModel):
    """Update profile request (all fields optional)"""
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    skills: Optional[List[str]] = None
    education: Optional[List[Education]] = None
    experience: Optional[List[Experience]] = None
    projects: Optional[List[Project]] = None
    certifications: Optional[List[Certification]] = None


class ProfileResponse(BaseModel):
    """Profile response"""
    id: int
    user_id: int
    full_name: str
    email: Optional[str]
    phone: Optional[str]
    linkedin: Optional[str]
    github: Optional[str]
    portfolio: Optional[str]
    location: Optional[str]
    summary: Optional[str]
    skills: List[str]
    education: List[dict]
    experience: List[dict]
    projects: List[dict]
    certifications: List[dict]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
