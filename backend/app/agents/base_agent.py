"""
Base Agent Class - Foundation for all ResumeAI agents
"""
from abc import ABC, abstractmethod
from typing import Dict, Any
from datetime import datetime


class BaseAgent(ABC):
    """Abstract base class for all agents in the system"""
    
    def __init__(self, agent_name: str, description: str):
        self.agent_name = agent_name
        self.description = description
        self.execution_history = []
    
    @abstractmethod
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Main execution method - must be implemented by subclasses"""
        pass
    
    async def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Wrapper method that handles execution, logging, and error handling"""
        start_time = datetime.now()
        
        try:
            self._log_execution("START", input_data)
            result = await self.execute(input_data)
            result["agent_name"] = self.agent_name
            result["execution_time"] = (datetime.now() - start_time).total_seconds()
            result["success"] = True
            self._log_execution("SUCCESS", result)
            return result
            
        except Exception as e:
            error_result = {
                "agent_name": self.agent_name,
                "success": False,
                "error": str(e),
                "error_type": type(e).__name__,
                "execution_time": (datetime.now() - start_time).total_seconds()
            }
            self._log_execution("ERROR", error_result)
            return error_result
    
    def _log_execution(self, status: str, data: Dict):
        """Log agent execution for debugging"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "agent": self.agent_name,
            "status": status,
            "data_summary": str(data)[:200]
        }
        self.execution_history.append(log_entry)
        print(f"[{self.agent_name}] {status}: {log_entry['data_summary']}")
