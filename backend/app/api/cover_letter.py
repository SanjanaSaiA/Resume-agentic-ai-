"""
Cover Letter API Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.models.job_analysis import CoverLetter
from app.schemas.resume import CoverLetterGenerateRequest, CoverLetterResponse
from app.utils.security import get_current_user
from app.agents.jd_extractor import jd_extractor_agent
from app.agents.cover_letter_generator import cover_letter_generator_agent

router = APIRouter(prefix="/api/cover-letter", tags=["Cover Letter"])


@router.post("/generate", response_model=CoverLetterResponse)
async def generate_cover_letter(
    request: CoverLetterGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate a tailored cover letter based on job description and user profile"""
    # Get user profile
    result = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Please create profile first.")
    
    # Extract job description - URL takes priority
    jd_input = {
        "job_url": request.job_url or "",
        "job_description_text": request.job_description or "",
        "job_title": request.job_title or "",
        "company_name": request.company_name or ""
    }
    
    jd_result = await jd_extractor_agent.run(jd_input)
    
    if not jd_result.get("success"):
        error_detail = jd_result.get("error", "Failed to extract job description")
        raise HTTPException(status_code=500, detail=error_detail)
    
    job_data = jd_result
    job_text = job_data.get("job_description", request.job_description or "")
    
    # Convert profile to dict with all fields
    profile_dict = {
        "full_name": profile.full_name,
        "email": profile.email,
        "phone": profile.phone,
        "linkedin": profile.linkedin,
        "github": profile.github,
        "portfolio": profile.portfolio,
        "location": profile.location,
        "summary": profile.summary,
        "skills": profile.skills or [],
        "education": profile.education or [],
        "experience": profile.experience or [],
        "projects": profile.projects or [],
        "certifications": profile.certifications or [],
    }
    
    # Generate cover letter
    gen_result = await cover_letter_generator_agent.run({
        "profile": profile_dict,
        "job_data": job_data
    })
    
    if not gen_result.get("success"):
        raise HTTPException(status_code=500, detail="Failed to generate cover letter")
    
    cover_letter_content = gen_result["cover_letter_content"]
    
    # Save to database
    cover_letter = CoverLetter(
        user_id=current_user.id,
        job_title=request.job_title or job_data.get("job_title"),
        company_name=request.company_name or job_data.get("company_name"),
        job_description=job_text,
        job_url=request.job_url,
        content=cover_letter_content
    )
    
    db.add(cover_letter)
    await db.commit()
    await db.refresh(cover_letter)
    
    return cover_letter


@router.get("/list", response_model=List[CoverLetterResponse])
async def list_cover_letters(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all user's cover letters"""
    result = await db.execute(
        select(CoverLetter).where(CoverLetter.user_id == current_user.id).order_by(CoverLetter.created_at.desc())
    )
    cover_letters = result.scalars().all()
    
    return cover_letters


@router.get("/{cover_letter_id}", response_model=CoverLetterResponse)
async def get_cover_letter(
    cover_letter_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get specific cover letter"""
    result = await db.execute(
        select(CoverLetter).where(CoverLetter.id == cover_letter_id, CoverLetter.user_id == current_user.id)
    )
    cover_letter = result.scalar_one_or_none()
    
    if not cover_letter:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    
    return cover_letter
