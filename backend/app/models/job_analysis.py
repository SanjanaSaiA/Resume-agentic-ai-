"""
Cover Letter and Job Analysis models
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class CoverLetter(Base):
    """Generated cover letters"""
    __tablename__ = "cover_letters"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Job Information
    job_title = Column(String(255))
    company_name = Column(String(255))
    job_description = Column(Text)
    job_url = Column(String(500))
    
    # Content
    content = Column(Text, nullable=False)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="cover_letters")
    
    def __repr__(self):
        return f"<CoverLetter(id={self.id}, job_title={self.job_title})>"


class JobAnalysis(Base):
    """Skill gap analysis results"""
    __tablename__ = "job_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Job Information
    job_title = Column(String(255))
    job_description = Column(Text)
    job_url = Column(String(500))
    
    # Analysis Results
    matching_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    priority_gaps = Column(JSON, default=list)
    learning_roadmap = Column(Text)
    match_percentage = Column(Integer)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="job_analyses")
    
    def __repr__(self):
        return f"<JobAnalysis(id={self.id}, job_title={self.job_title}, match={self.match_percentage}%)>"
