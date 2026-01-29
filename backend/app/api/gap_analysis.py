"""
Gap Analysis API Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.models.job_analysis import JobAnalysis
from app.schemas.resume import GapAnalysisRequest, GapAnalysisResponse
from app.utils.security import get_current_user
from app.agents.jd_extractor import jd_extractor_agent
from app.agents.gap_analyser import gap_analyser_agent

router = APIRouter(prefix="/api/gap-analysis", tags=["Gap Analysis"])


@router.post("/analyze", response_model=GapAnalysisResponse)
async def analyze_skill_gap(
    request: GapAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Analyze skill gaps between user profile and job requirements"""
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
        "company_name": ""
    }
    
    jd_result = await jd_extractor_agent.run(jd_input)
    
    if not jd_result.get("success"):
        error_detail = jd_result.get("error", "Failed to extract job description")
        raise HTTPException(status_code=500, detail=error_detail)
    
    job_data = jd_result
    
    # Convert profile to dict
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
    
    # Perform gap analysis
    analysis_result = await gap_analyser_agent.run({
        "profile": profile_dict,
        "job_data": job_data
    })
    
    if not analysis_result.get("success"):
        raise HTTPException(status_code=500, detail="Failed to analyze skill gap")
    
    # Save to database
    job_analysis = JobAnalysis(
        user_id=current_user.id,
        job_title=request.job_title or job_data.get("job_title"),
        job_description=job_data.get("job_description", ""),
        job_url=request.job_url,
        matching_skills=analysis_result.get("matching_skills", []),
        missing_skills=analysis_result.get("missing_skills", []),
        priority_gaps=analysis_result.get("priority_gaps", []),
        learning_roadmap=analysis_result.get("learning_roadmap", ""),
        match_percentage=analysis_result.get("match_percentage", 0),
        # Store additional data in the priority_gaps JSON field
    )
    
    db.add(job_analysis)
    await db.commit()
    await db.refresh(job_analysis)
    
    # Build response with additional fields
    return {
        "id": job_analysis.id,
        "job_title": job_analysis.job_title,
        "matching_skills": job_analysis.matching_skills,
        "missing_skills": job_analysis.missing_skills,
        "priority_gaps": job_analysis.priority_gaps,
        "learning_roadmap": job_analysis.learning_roadmap,
        "match_percentage": job_analysis.match_percentage,
        "created_at": job_analysis.created_at,
        "strengths": analysis_result.get("strengths", []),
        "recommendations": analysis_result.get("recommendations", []),
        "certifications_suggested": analysis_result.get("certifications_suggested", []),
        "training_courses": analysis_result.get("training_courses", [])
    }


@router.get("/list", response_model=List[GapAnalysisResponse])
async def list_gap_analyses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all user's gap analyses"""
    result = await db.execute(
        select(JobAnalysis).where(JobAnalysis.user_id == current_user.id).order_by(JobAnalysis.created_at.desc())
    )
    analyses = result.scalars().all()
    
    # Convert to response format with default values for new fields
    return [
        {
            "id": a.id,
            "job_title": a.job_title,
            "matching_skills": a.matching_skills or [],
            "missing_skills": a.missing_skills or [],
            "priority_gaps": a.priority_gaps or [],
            "learning_roadmap": a.learning_roadmap or "",
            "match_percentage": a.match_percentage or 0,
            "created_at": a.created_at,
            "strengths": [],
            "recommendations": [],
            "certifications_suggested": [],
            "training_courses": []
        }
        for a in analyses
    ]


@router.get("/{analysis_id}", response_model=GapAnalysisResponse)
async def get_gap_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get specific gap analysis"""
    result = await db.execute(
        select(JobAnalysis).where(JobAnalysis.id == analysis_id, JobAnalysis.user_id == current_user.id)
    )
    analysis = result.scalar_one_or_none()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Gap analysis not found")
    
    return {
        "id": analysis.id,
        "job_title": analysis.job_title,
        "matching_skills": analysis.matching_skills or [],
        "missing_skills": analysis.missing_skills or [],
        "priority_gaps": analysis.priority_gaps or [],
        "learning_roadmap": analysis.learning_roadmap or "",
        "match_percentage": analysis.match_percentage or 0,
        "created_at": analysis.created_at,
        "strengths": [],
        "recommendations": [],
        "certifications_suggested": [],
        "training_courses": []
    }
