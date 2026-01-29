"""
Agent 5: Resume Optimizer (Loop Controller)
Iteratively improves resume until ATS >= 85%
"""
from typing import Dict, Any
from app.agents.base_agent import BaseAgent
from app.services.llm_service import llm_service
from app.config import settings


class OptimizerAgent(BaseAgent):
    """Optimizes resume iteratively"""
    
    def __init__(self):
        super().__init__("Optimizer", "Optimizes resume iteratively")
        self.target_score = settings.ATS_TARGET_SCORE
        self.max_iterations = settings.MAX_OPTIMIZATION_ITERATIONS
    
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        current_resume = input_data.get("resume_content")
        ats_score = input_data.get("ats_score", 0)
        iteration = input_data.get("iteration", 1)
        optimization_history = input_data.get("optimization_history", [])
        
        if ats_score >= self.target_score:
            return {
                "should_continue": False,
                "final_resume": current_resume,
                "final_score": ats_score,
                "total_iterations": iteration
            }
        
        if iteration >= self.max_iterations:
            return {
                "should_continue": False,
                "final_resume": current_resume,
                "final_score": ats_score,
                "total_iterations": iteration,
                "note": "Max iterations reached"
            }
        
        # Optimize
        ats_feedback = {
            "score": ats_score,
            "missing_keywords": input_data.get("missing_keywords", []),
            "suggestions": input_data.get("suggestions", [])
        }
        
        improved_resume = await llm_service.optimize_resume(current_resume, ats_feedback, iteration)
        
        optimization_history.append({
            "iteration": iteration,
            "score": ats_score,
            "changes": ats_feedback.get("suggestions", [])
        })
        
        return {
            "should_continue": True,
            "resume_content": improved_resume,
            "iteration": iteration + 1,
            "optimization_history": optimization_history
        }


# Global instance
optimizer_agent = OptimizerAgent()
