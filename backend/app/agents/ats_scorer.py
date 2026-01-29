"""
Agent 4: ATS Scoring Agent  
Calculates ATS compatibility score
"""
from typing import Dict, Any
from app.agents.base_agent import BaseAgent
from app.services.llm_service import llm_service


class ATSScorerAgent(BaseAgent):
    """Calculates ATS score"""
    
    def __init__(self):
        super().__init__("ATS_Scorer", "Calculates ATS score")
    
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        resume_content = input_data.get("resume_content")
        job_data = input_data.get("job_data")
        
        if not resume_content or not job_data:
            raise ValueError("resume_content and job_data required")
        
        # Calculate ATS score using LLM service
        score_data = await llm_service.calculate_ats_score(
            resume_content=resume_content,
            job_requirements=job_data
        )
        
        return {
            "ats_score": score_data.get("ats_score", 0),
            "keyword_matches": score_data.get("keyword_matches", []),
            "missing_keywords": score_data.get("missing_keywords", []),
            "suggestions": score_data.get("suggestions", [])
        }


# Global instance
ats_scorer_agent = ATSScorerAgent()
