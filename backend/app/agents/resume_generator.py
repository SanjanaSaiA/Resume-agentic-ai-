"""
Agent 3: Resume Generator Agent
Creates tailored resume content
"""
from typing import Dict, Any
from app.agents.base_agent import BaseAgent
from app.services.llm_service import llm_service


class ResumeGeneratorAgent(BaseAgent):
    """Generates tailored resumes"""
    
    def __init__(self):
        super().__init__("Resume_Generator", "Generates tailored resumes")
    
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        job_data = input_data.get("job_data")
        profile = input_data.get("profile")
        
        if not job_data or not profile:
            raise ValueError("job_data and profile required")
        
        # Generate resume using LLM service
        resume_content = await llm_service.generate_resume_content(
            profile=profile,
            job_data=job_data
        )
        
        return {
            "resume_content": resume_content,
            "iteration": 1
        }


# Global instance
resume_generator_agent = ResumeGeneratorAgent()
