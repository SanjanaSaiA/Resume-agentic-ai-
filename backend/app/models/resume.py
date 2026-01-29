"""
Resume model - Generated resumes
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Resume(Base):
    """Generated resume with optimization history"""
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Job Information
    job_title = Column(String(255))
    company_name = Column(String(255))
    job_description = Column(Text)
    job_url = Column(String(500))
    
    # Resume Content
    latex_content = Column(Text, nullable=False)
    pdf_path = Column(String(500))
    
    # ATS Optimization
    ats_score = Column(Integer)
    iterations = Column(Integer, default=1)
    keywords = Column(JSON, default=list)
    optimization_history = Column(JSON, default=list)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="resumes")
    
    def __repr__(self):
        return f"<Resume(id={self.id}, job_title={self.job_title}, ats_score={self.ats_score})>"
