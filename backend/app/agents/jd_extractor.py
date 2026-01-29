"""
Agent 1: Job Description Extractor
Extracts requirements from job URL or text
"""
from typing import Dict, Any
from app.agents.base_agent import BaseAgent
from app.services.llm_service import llm_service
from app.services.web_scraper import web_scraper


class JDExtractorAgent(BaseAgent):
    """Extracts and structures job description data from URLs or text"""
    
    def __init__(self):
        super().__init__("JD_Extractor", "Extracts job description information from URLs or text")
    
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract job description from URL or text
        
        Args:
            input_data: Dict with either job_url or job_description_text
            
        Returns:
            Structured job data
        """
        job_url = input_data.get("job_url", "")
        job_text = input_data.get("job_description_text", "")
        job_title = input_data.get("job_title", "")
        company_name = input_data.get("company_name", "")
        
        # If URL is provided, fetch the job description
        if job_url and job_url.strip():
            print(f"Fetching job from URL: {job_url}")
            scrape_result = await web_scraper.fetch_job_from_url(job_url.strip())
            
            if scrape_result.get("success"):
                job_text = scrape_result.get("job_text", "")
                # Use scraped title/company if not provided
                if not job_title:
                    job_title = scrape_result.get("title", "")
                if not company_name:
                    company_name = scrape_result.get("company", "")
                print(f"Successfully extracted {len(job_text)} characters from URL")
            else:
                error_msg = scrape_result.get("error", "Failed to fetch URL")
                print(f"URL fetch failed: {error_msg}")
                raise ValueError(f"Could not extract job from URL: {error_msg}")
        
        if not job_text or len(job_text.strip()) < 20:
            raise ValueError("No job description available. Please provide a valid URL or paste the job description.")
        
        # Structure the data using LLM
        structured_data = await self._structure_job_data(job_text)
        
        # Override with provided values if available
        if job_title:
            structured_data["job_title"] = job_title
        if company_name:
            structured_data["company_name"] = company_name
        
        return structured_data
    
    async def _structure_job_data(self, raw_text: str) -> Dict:
        """Use LLM to structure job description data"""
        prompt = f"""Extract structured information from this job description.

JOB DESCRIPTION:
{raw_text[:4000]}

Extract and return JSON with these fields:
{{
    "job_title": "exact job title",
    "company_name": "company name",
    "job_description": "brief summary of the role",
    "requirements": ["requirement 1", "requirement 2"],
    "responsibilities": ["responsibility 1", "responsibility 2"],
    "skills_required": ["skill 1", "skill 2"],
    "preferred_skills": ["preferred skill 1", "preferred skill 2"],
    "experience_level": "entry/mid/senior",
    "keywords": ["important keyword 1", "important keyword 2"]
}}
"""
        
        try:
            result = await llm_service.extract_json(raw_text, prompt)
        except Exception as e:
            print(f"LLM extraction error: {e}")
            result = {}
        
        default_result = {
            "job_title": "Position",
            "company_name": "Company",
            "job_description": raw_text[:1000],
            "requirements": [],
            "responsibilities": [],
            "skills_required": [],
            "preferred_skills": [],
            "experience_level": "mid",
            "keywords": []
        }
        
        # Merge results
        if isinstance(result, dict):
            for key, value in result.items():
                if value:  # Only update if value is not empty
                    default_result[key] = value
        
        return default_result


# Global instance
jd_extractor_agent = JDExtractorAgent()
