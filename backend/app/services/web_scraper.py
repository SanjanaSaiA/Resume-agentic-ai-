"""
Web Scraper Service for extracting job descriptions from URLs
Supports LinkedIn, Indeed, Glassdoor, and general job posting pages
"""
import httpx
from bs4 import BeautifulSoup
from typing import Optional, Dict, Any
import re
import json
from urllib.parse import urlparse, parse_qs


class WebScraperService:
    """Service for scraping job descriptions from URLs"""
    
    def __init__(self):
        # Browser-like headers to avoid blocking
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "DNT": "1",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
        }
    
    async def fetch_job_from_url(self, url: str) -> Dict[str, Any]:
        """
        Fetch job description from URL
        
        Args:
            url: Job posting URL
            
        Returns:
            Dict with job_text and metadata
        """
        try:
            # First, try to extract info from URL pattern
            url_info = self._parse_url_info(url)
            
            # Try to fetch the page
            if "linkedin.com" in url:
                result = await self._fetch_linkedin(url)
            elif "indeed.com" in url:
                result = await self._fetch_indeed(url)
            elif "glassdoor.com" in url:
                result = await self._fetch_glassdoor(url)
            else:
                result = await self._fetch_generic(url)
            
            # If fetch failed but we have URL info, use that
            if not result.get("success") and url_info:
                return {
                    "success": True,
                    "job_text": self._generate_placeholder_jd(url_info, url),
                    "title": url_info.get("title", ""),
                    "company": url_info.get("company", ""),
                    "source": "url_parsed",
                    "note": "Job details extracted from URL. For best results, paste the full job description."
                }
            
            return result
            
        except Exception as e:
            error_msg = str(e)
            print(f"Error fetching URL {url}: {error_msg}")
            
            # Try URL parsing as fallback
            url_info = self._parse_url_info(url)
            if url_info:
                return {
                    "success": True,
                    "job_text": self._generate_placeholder_jd(url_info, url),
                    "title": url_info.get("title", ""),
                    "company": url_info.get("company", ""),
                    "source": "url_parsed",
                    "note": f"Could not fetch page directly. Using URL info. Error: {error_msg[:100]}"
                }
            
            return {
                "success": False,
                "error": f"Could not fetch job: {error_msg}",
                "job_text": ""
            }
    
    def _parse_url_info(self, url: str) -> Optional[Dict[str, str]]:
        """Extract job info from URL pattern"""
        try:
            parsed = urlparse(url)
            path = parsed.path.lower()
            
            info = {}
            
            # LinkedIn pattern: /jobs/view/123456/ or /jobs/view/job-title-at-company-123456/
            if "linkedin.com" in url:
                info["source"] = "LinkedIn"
                # Try to extract job ID
                match = re.search(r'/jobs/view/(\d+)', url)
                if match:
                    info["job_id"] = match.group(1)
                # Try to extract title from URL
                title_match = re.search(r'/jobs/view/([^/]+)-at-([^/]+)-\d+', url)
                if title_match:
                    info["title"] = title_match.group(1).replace('-', ' ').title()
                    info["company"] = title_match.group(2).replace('-', ' ').title()
            
            # Indeed pattern
            elif "indeed.com" in url:
                info["source"] = "Indeed"
                # Extract job key
                jk = parse_qs(parsed.query).get('jk', [''])[0]
                if jk:
                    info["job_id"] = jk
            
            # Glassdoor pattern
            elif "glassdoor.com" in url:
                info["source"] = "Glassdoor"
            
            return info if info else None
            
        except Exception:
            return None
    
    def _generate_placeholder_jd(self, url_info: Dict, url: str) -> str:
        """Generate a placeholder JD from URL info"""
        source = url_info.get("source", "Job Board")
        title = url_info.get("title", "Position")
        company = url_info.get("company", "Company")
        
        return f"""Job Posting from {source}

Job Title: {title}
Company: {company}
Source URL: {url}

Note: This job description was extracted from the URL pattern. 
For the most accurate resume generation, please use the "Paste JD" option 
and copy the full job description from the job posting.

The AI will generate a resume based on:
- The job title and company extracted from the URL
- Your profile information
- Standard requirements for this type of role
"""
    
    async def _fetch_linkedin(self, url: str) -> Dict[str, Any]:
        """Fetch job from LinkedIn"""
        try:
            async with httpx.AsyncClient(
                follow_redirects=True, 
                timeout=30.0,
                verify=True
            ) as client:
                response = await client.get(url, headers=self.headers)
                
                if response.status_code != 200:
                    return {
                        "success": False,
                        "error": f"LinkedIn returned status {response.status_code}. This job may require login.",
                        "job_text": ""
                    }
                
                soup = BeautifulSoup(response.text, 'lxml')
                
                # LinkedIn job description selectors
                job_text = ""
                title = ""
                company = ""
                
                # Try multiple selectors for job title
                title_selectors = [
                    'h1.top-card-layout__title',
                    'h1.topcard__title',
                    'h1[class*="job-title"]',
                    'h1',
                ]
                for selector in title_selectors:
                    elem = soup.select_one(selector)
                    if elem:
                        title = elem.get_text(strip=True)
                        break
                
                # Try multiple selectors for company
                company_selectors = [
                    'a.topcard__org-name-link',
                    'a[class*="company-name"]',
                    'span.topcard__flavor',
                    '.top-card-layout__card .topcard__org-name-link',
                ]
                for selector in company_selectors:
                    elem = soup.select_one(selector)
                    if elem:
                        company = elem.get_text(strip=True)
                        break
                
                # Job description selectors
                desc_selectors = [
                    'div.show-more-less-html__markup',
                    'div.description__text',
                    'section.show-more-less-html',
                    'div[class*="job-description"]',
                    'div[class*="description"]',
                    'article',
                ]
                
                for selector in desc_selectors:
                    elem = soup.select_one(selector)
                    if elem:
                        job_text = elem.get_text(separator='\n', strip=True)
                        if len(job_text) > 100:
                            break
                
                # If still no job text, try to get all text from main content
                if not job_text or len(job_text) < 100:
                    main_content = soup.select_one('main') or soup.select_one('body')
                    if main_content:
                        job_text = main_content.get_text(separator='\n', strip=True)
                
                # Clean up text
                job_text = self._clean_text(job_text)
                
                if len(job_text) < 50:
                    return {
                        "success": False,
                        "error": "Could not extract job description. LinkedIn may require login for this job.",
                        "job_text": ""
                    }
                
                return {
                    "success": True,
                    "job_text": job_text,
                    "title": title,
                    "company": company,
                    "source": "linkedin"
                }
        except httpx.ConnectError as e:
            return {
                "success": False,
                "error": f"Connection error: {str(e)}. Check your internet connection.",
                "job_text": ""
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "job_text": ""
            }
    
    async def _fetch_indeed(self, url: str) -> Dict[str, Any]:
        """Fetch job from Indeed"""
        try:
            async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
                response = await client.get(url, headers=self.headers)
                
                if response.status_code != 200:
                    return {"success": False, "error": f"Indeed returned status {response.status_code}", "job_text": ""}
                
                soup = BeautifulSoup(response.text, 'lxml')
                
                job_text = ""
                title = ""
                company = ""
                
                # Indeed selectors
                title_elem = soup.select_one('h1.jobsearch-JobInfoHeader-title') or soup.select_one('h1')
                if title_elem:
                    title = title_elem.get_text(strip=True)
                
                company_elem = soup.select_one('div[data-company-name]') or soup.select_one('.jobsearch-CompanyAvatar')
                if company_elem:
                    company = company_elem.get_text(strip=True)
                
                desc_elem = soup.select_one('#jobDescriptionText') or soup.select_one('div[class*="jobDescription"]')
                if desc_elem:
                    job_text = desc_elem.get_text(separator='\n', strip=True)
                
                job_text = self._clean_text(job_text)
                
                return {
                    "success": bool(job_text),
                    "job_text": job_text,
                    "title": title,
                    "company": company,
                    "source": "indeed"
                }
        except Exception as e:
            return {"success": False, "error": str(e), "job_text": ""}
    
    async def _fetch_glassdoor(self, url: str) -> Dict[str, Any]:
        """Fetch job from Glassdoor"""
        try:
            async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
                response = await client.get(url, headers=self.headers)
                
                if response.status_code != 200:
                    return {"success": False, "error": f"Glassdoor returned status {response.status_code}", "job_text": ""}
                
                soup = BeautifulSoup(response.text, 'lxml')
                
                job_text = ""
                desc_elem = soup.select_one('[class*="jobDescription"]') or soup.select_one('[class*="JobDetails"]')
                if desc_elem:
                    job_text = desc_elem.get_text(separator='\n', strip=True)
                
                job_text = self._clean_text(job_text)
                
                return {
                    "success": bool(job_text),
                    "job_text": job_text,
                    "source": "glassdoor"
                }
        except Exception as e:
            return {"success": False, "error": str(e), "job_text": ""}
    
    async def _fetch_generic(self, url: str) -> Dict[str, Any]:
        """Fetch job from generic URL"""
        try:
            async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
                response = await client.get(url, headers=self.headers)
                
                if response.status_code != 200:
                    return {"success": False, "error": f"Site returned status {response.status_code}", "job_text": ""}
                
                soup = BeautifulSoup(response.text, 'lxml')
                
                # Remove script and style elements
                for script in soup(["script", "style", "nav", "footer", "header"]):
                    script.decompose()
                
                # Try common job description containers
                job_text = ""
                selectors = [
                    '[class*="job-description"]',
                    '[class*="jobDescription"]',
                    '[class*="job_description"]',
                    '[id*="job-description"]',
                    '[id*="jobDescription"]',
                    'article',
                    'main',
                    '.content',
                    '#content',
                ]
                
                for selector in selectors:
                    elem = soup.select_one(selector)
                    if elem:
                        text = elem.get_text(separator='\n', strip=True)
                        if len(text) > len(job_text):
                            job_text = text
                
                # Fallback to body
                if not job_text:
                    job_text = soup.get_text(separator='\n', strip=True)
                
                job_text = self._clean_text(job_text)
                
                # Try to extract title
                title = ""
                h1 = soup.select_one('h1')
                if h1:
                    title = h1.get_text(strip=True)
                
                return {
                    "success": bool(job_text),
                    "job_text": job_text[:5000],  # Limit text length
                    "title": title,
                    "source": "generic"
                }
        except Exception as e:
            return {"success": False, "error": str(e), "job_text": ""}
    
    def _clean_text(self, text: str) -> str:
        """Clean extracted text"""
        if not text:
            return ""
        
        # Remove excessive whitespace
        text = re.sub(r'\n\s*\n', '\n\n', text)
        text = re.sub(r'[ \t]+', ' ', text)
        
        # Remove common boilerplate
        boilerplate = [
            r'Sign in to apply',
            r'Easy Apply',
            r'Save job',
            r'Report this job',
            r'Show more',
            r'Show less',
            r'See who you know',
        ]
        for pattern in boilerplate:
            text = re.sub(pattern, '', text, flags=re.IGNORECASE)
        
        return text.strip()


# Global instance
web_scraper = WebScraperService()
