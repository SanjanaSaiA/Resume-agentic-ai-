"""
Resume API Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.models.resume import Resume
from app.schemas.resume import ResumeGenerateRequest, ResumeGenerateResponse, ResumeListResponse
from app.utils.security import get_current_user
from app.agents.jd_extractor import jd_extractor_agent
from app.agents.resume_generator import resume_generator_agent
from app.agents.ats_scorer import ats_scorer_agent
from app.agents.optimizer_agent import optimizer_agent

router = APIRouter(prefix="/api/resume", tags=["Resume"])


@router.post("/generate", response_model=ResumeGenerateResponse)
async def generate_resume(
    request: ResumeGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate optimized resume with ATS loop"""
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
    
    # Generate resume
    gen_result = await resume_generator_agent.run({
        "profile": profile_dict,
        "job_data": job_data
    })
    
    if not gen_result.get("success"):
        raise HTTPException(status_code=500, detail="Failed to generate resume")
    
    resume_content = gen_result["resume_content"]
    optimization_history = []
    
    # Optimization loop
    for iteration in range(1, 6):
        # Score resume
        score_result = await ats_scorer_agent.run({
            "resume_content": resume_content,
            "job_data": job_data
        })
        
        if not score_result.get("success"):
            break
        
        ats_score = score_result.get("ats_score", 0)
        
        # Check if optimization needed
        opt_result = await optimizer_agent.run({
            "resume_content": resume_content,
            "ats_score": ats_score,
            "iteration": iteration,
            "missing_keywords": score_result.get("missing_keywords", []),
            "suggestions": score_result.get("suggestions", []),
            "optimization_history": optimization_history
        })
        
        if not opt_result.get("should_continue"):
            break
        
        resume_content = opt_result["resume_content"]
        optimization_history = opt_result.get("optimization_history", [])
    
    # Final score
    final_score_result = await ats_scorer_agent.run({
        "resume_content": resume_content,
        "job_data": job_data
    })
    
    final_score = final_score_result.get("ats_score", 0) if final_score_result.get("success") else 0
    
    # Save to database
    resume = Resume(
        user_id=current_user.id,
        job_title=request.job_title or job_data.get("job_title"),
        company_name=request.company_name or job_data.get("company_name"),
        job_description=job_text,
        job_url=request.job_url,
        latex_content=resume_content,
        ats_score=final_score,
        iterations=len(optimization_history) + 1,
        keywords=final_score_result.get("keyword_matches", []),
        optimization_history=optimization_history
    )
    
    db.add(resume)
    await db.commit()
    await db.refresh(resume)
    
    return resume


@router.get("/list", response_model=List[ResumeListResponse])
async def list_resumes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all user's resumes"""
    result = await db.execute(
        select(Resume).where(Resume.user_id == current_user.id).order_by(Resume.created_at.desc())
    )
    resumes = result.scalars().all()
    
    return resumes


@router.get("/{resume_id}", response_model=ResumeGenerateResponse)
async def get_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get specific resume"""
    result = await db.execute(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == current_user.id)
    )
    resume = result.scalar_one_or_none()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    return resume



