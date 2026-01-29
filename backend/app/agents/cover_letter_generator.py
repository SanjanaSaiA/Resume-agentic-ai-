"""
Agent: Cover Letter Generator
Creates tailored cover letters based on job description and user profile
"""
from typing import Dict, Any
from app.agents.base_agent import BaseAgent
from app.services.llm_service import llm_service


class CoverLetterGeneratorAgent(BaseAgent):
    """Generates tailored cover letters for job applications"""
    
    def __init__(self):
        super().__init__(
            "Cover_Letter_Generator", 
            "Generates personalized cover letters tailored to job descriptions"
        )
    
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a cover letter based on job data and user profile
        
        Args:
            input_data: Dict with 'job_data' and 'profile' keys
            
        Returns:
            Dict with generated cover letter content
        """
        job_data = input_data.get("job_data")
        profile = input_data.get("profile")
        
        if not job_data or not profile:
            raise ValueError("job_data and profile are required")
        
        # Generate cover letter using LLM service
        cover_letter_content = await llm_service.generate_cover_letter_content(
            profile=profile,
            job_data=job_data
        )
        
        return {
            "cover_letter_content": cover_letter_content,
            "job_title": job_data.get("job_title", ""),
            "company_name": job_data.get("company_name", "")
        }


# Global instance
cover_letter_generator_agent = CoverLetterGeneratorAgent()
