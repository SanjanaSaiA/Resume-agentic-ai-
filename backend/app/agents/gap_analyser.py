"""
Agent: Gap Analyser
Analyzes skill gaps between user profile and job requirements
Provides recommendations for training, certifications, and learning paths
"""
from typing import Dict, Any
from app.agents.base_agent import BaseAgent
from app.services.llm_service import llm_service


class GapAnalyserAgent(BaseAgent):
    """Analyzes skill gaps and provides improvement recommendations"""
    
    def __init__(self):
        super().__init__(
            "Gap_Analyser", 
            "Analyzes skill gaps between candidate profile and job requirements"
        )
    
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform comprehensive gap analysis
        
        Args:
            input_data: Dict with 'job_data' and 'profile' keys
            
        Returns:
            Dict with gap analysis results including:
            - matching_skills: Skills the candidate has that match job requirements
            - missing_skills: Skills required but not possessed
            - priority_gaps: Prioritized list of skill gaps
            - recommendations: Specific training/certification recommendations
            - learning_roadmap: Structured learning path
            - match_percentage: Overall skill match percentage
            - strengths: Analysis of candidate strengths
        """
        job_data = input_data.get("job_data")
        profile = input_data.get("profile")
        
        if not job_data or not profile:
            raise ValueError("job_data and profile are required")
        
        # Perform gap analysis using LLM service
        analysis_result = await llm_service.analyze_skill_gap(
            profile=profile,
            job_data=job_data
        )
        
        return {
            "matching_skills": analysis_result.get("matching_skills", []),
            "missing_skills": analysis_result.get("missing_skills", []),
            "priority_gaps": analysis_result.get("priority_gaps", []),
            "recommendations": analysis_result.get("recommendations", []),
            "certifications_suggested": analysis_result.get("certifications_suggested", []),
            "training_courses": analysis_result.get("training_courses", []),
            "learning_roadmap": analysis_result.get("learning_roadmap", ""),
            "match_percentage": analysis_result.get("match_percentage", 0),
            "strengths": analysis_result.get("strengths", []),
            "job_title": job_data.get("job_title", ""),
            "company_name": job_data.get("company_name", "")
        }


# Global instance
gap_analyser_agent = GapAnalyserAgent()
