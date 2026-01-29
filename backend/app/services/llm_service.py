"""
LLM Service for AI-powered resume optimization
Uses xAI Grok API (OpenAI-compatible) as primary provider
"""
import json
import re
from typing import Dict, Any, List, Optional
from app.config import settings
from openai import OpenAI


class LLMService:
    """Service for interacting with LLM APIs"""
    
    def __init__(self):
        # Use Groq API (fast inference with Llama models)
        self.client = OpenAI(
            api_key=settings.GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1"
        )
        self.model = "llama-3.3-70b-versatile"  # Groq's best model
    
    async def generate_text(self, prompt: str, max_tokens: int = 2000) -> str:
        """
        Generate text using Grok API
        
        Args:
            prompt: Input prompt
            max_tokens: Maximum tokens to generate
            
        Returns:
            Generated text
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert resume writer and ATS optimization specialist."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=0.7,
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Grok API error: {e}")
            raise Exception(f"Failed to generate text: {str(e)}")
    
    async def extract_json(self, text: str, prompt: str) -> Dict[str, Any]:
        """
        Extract structured JSON from text using LLM
        
        Args:
            text: Input text to analyze
            prompt: Instruction prompt
            
        Returns:
            Extracted JSON data
        """
        full_prompt = f"""{prompt}

Text to analyze:
{text}

Return ONLY valid JSON, no other text."""
        
        try:
            response = await self.generate_text(full_prompt, max_tokens=1500)
            
            # Extract JSON from response
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            
            # Try to parse entire response as JSON
            return json.loads(response)
        except json.JSONDecodeError:
            # Return basic structure if JSON parsing fails
            return {"error": "Failed to parse JSON", "raw_response": response}
        except Exception as e:
            print(f"JSON extraction error: {e}")
            return {"error": str(e)}
    
    async def calculate_ats_score(
        self, 
        resume_content: str, 
        job_requirements: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculate ATS score for resume against job requirements
        
        Args:
            resume_content: Resume text
            job_requirements: Job requirements data
            
        Returns:
            ATS score and analysis
        """
        # Extract skills from job requirements
        required_skills = job_requirements.get('skills_required', [])
        preferred_skills = job_requirements.get('preferred_skills', [])
        all_skills = required_skills + preferred_skills
        
        prompt = f"""You are an ATS (Applicant Tracking System) analyzer. Analyze this resume against the job requirements and provide a score from 0-100.

Job Requirements:
- Title: {job_requirements.get('job_title', 'N/A')}
- Company: {job_requirements.get('company_name', 'N/A')}
- Required Skills: {', '.join(required_skills[:10])}
- Preferred Skills: {', '.join(preferred_skills[:10])}
- Experience Level: {job_requirements.get('experience_level', 'N/A')}
- Key Requirements: {', '.join(job_requirements.get('requirements', [])[:5])}

Resume Content:
{resume_content[:2000]}

Analyze and return JSON with:
{{
    "ats_score": <number 0-100>,
    "keyword_matches": [<list of matched keywords>],
    "missing_keywords": [<list of important missing keywords>],
    "suggestions": [<list of improvement suggestions>]
}}"""
        
        result = await self.extract_json("", prompt)
        
        # Ensure score is within range
        if "ats_score" in result:
            result["ats_score"] = max(0, min(100, result.get("ats_score", 0)))
        else:
            result["ats_score"] = 50  # Default score
        
        return result
    
    async def generate_resume_content(
        self,
        profile: Dict[str, Any],
        job_data: Dict[str, Any]
    ) -> str:
        """
        Generate tailored resume content in LaTeX format
        
        Args:
            profile: User profile data
            job_data: Job requirements data
            
        Returns:
            LaTeX resume content
        """
        # Extract skills from job_data
        required_skills = job_data.get('skills_required', [])
        preferred_skills = job_data.get('preferred_skills', [])
        all_job_skills = required_skills + preferred_skills
        
        # Format profile data for prompt
        education_text = self._format_education(profile.get('education', []))
        experience_text = self._format_experience(profile.get('experience', []))
        projects_text = self._format_projects(profile.get('projects', []))
        certs_text = self._format_certifications(profile.get('certifications', []))
        
        prompt = f"""You are an expert resume writer. Create a job-tailored, ATS-optimized resume using the EXACT LaTeX template format provided below.

TARGET JOB:
Position: {job_data.get('job_title', 'N/A')} at {job_data.get('company_name', 'N/A')}
Required Skills: {', '.join(all_job_skills[:20])}
Key Requirements: {', '.join(job_data.get('requirements', [])[:8])}
Responsibilities: {', '.join(job_data.get('responsibilities', [])[:8])}

CANDIDATE PROFILE:
Name: {profile.get('full_name', 'N/A')}
Email: {profile.get('email', 'N/A')} | Phone: {profile.get('phone', 'N/A')}
Location: {profile.get('location', 'N/A')}
LinkedIn: {profile.get('linkedin', 'N/A')} | GitHub: {profile.get('github', 'N/A')}

Current Summary: {profile.get('summary', 'N/A')}
ALL Skills: {', '.join(profile.get('skills', []))}

EDUCATION:
{education_text}

EXPERIENCE:
{experience_text}

ALL PROJECTS (select 2-4 most relevant):
{projects_text}

CERTIFICATIONS:
{certs_text}

MANDATORY TEMPLATE FORMAT - DO NOT CHANGE STRUCTURE:

\\documentclass[a4paper,10pt]{{article}}

% -------------------- Packages --------------------
\\usepackage[unicode, draft=false]{{hyperref}}
\\hypersetup{{
    hidelinks,
    colorlinks=false,
    pdfborder={{0 0 0}}
}}
\\usepackage{{fontawesome5}}
\\usepackage{{parskip}}
\\usepackage{{xcolor}}
\\usepackage[scale=0.9, top=0.5in, bottom=0.5in, left=0.5in, right=0.5in]{{geometry}}
\\usepackage{{tabularx}}
\\usepackage{{enumitem}}
\\usepackage{{titlesec}}
\\usepackage{{multicol}}
\\usepackage{{setspace}}

% -------------------- Customizations --------------------
\\definecolor{{PrimaryColor}}{{HTML}}{{1C033C}}
\\definecolor{{SecondaryColor}}{{HTML}}{{371e77}}

\\titleformat{{\\section}}{{\\large\\scshape\\raggedright}}{{}}{{0em}}{{}}[\\titlerule]
\\titlespacing{{\\section}}{{0pt}}{{8pt}}{{4pt}}

\\pagestyle{{empty}}

% -------------------- Document --------------------
\\begin{{document}}

% -------------------- Header --------------------
\\begin{{center}}
    \\color{{PrimaryColor}}
    \\Huge\\textbf{{{profile.get('full_name', 'YOUR NAME')}}}\\\\[6pt]
    \\normalsize
    \\color{{SecondaryColor}}
    \\underline{{\\faEnvelope}} \\href{{mailto:{profile.get('email', 'email@example.com')}}}{{{profile.get('email', 'email@example.com')}}} \\quad
    \\underline{{\\faMobile}} {profile.get('phone', '+91 XXXXXXXXXX')} \\\\[3pt]
    \\underline{{\\faGithub}} \\href{{{profile.get('github', '#')}}}{{{profile.get('github', 'github.com/username').replace('https://github.com/', 'github.com/')}}} \\quad
    \\underline{{\\faLinkedin}} \\href{{{profile.get('linkedin', '#')}}}{{{profile.get('linkedin', 'linkedin.com/in/profile').replace('https://www.linkedin.com/in/', 'linkedin.com/in/')}}}
\\end{{center}}

% -------------------- Profile --------------------
\\section*{{PROFILE}}
[Write a NEW 2-3 line professional summary tailored to the {job_data.get('job_title')} role, emphasizing relevant skills from the job requirements]

% -------------------- Skills --------------------
\\section{{SKILLS}}
\\begin{{itemize}}[leftmargin=1.5em, itemsep=2pt, nosep]
    \\item \\textbf{{Programming Languages:}} [List programming languages, prioritizing those in job requirements]
    \\item \\textbf{{Web \\& Database:}} [List web/database technologies if relevant]
    \\item \\textbf{{ML/AI \\& Libraries:}} [List ML/AI tools if relevant]
    \\item \\textbf{{Cloud \\& Tools:}} [List cloud platforms and tools]
    \\item \\textbf{{Core Concepts:}} [List relevant concepts from job requirements]
\\end{{itemize}}

% -------------------- Education --------------------
\\section*{{EDUCATION}}
\\begin{{tabularx}}{{\\textwidth}}{{X r}}
[For each education entry, format as:]
\\textbf{{University, Location}} & \\textbf{{Start Year -- End Year}}\\\\
Degree in Field & \\textit{{CGPA: X.XX/10}} \\\\[4pt]

\\end{{tabularx}}

% -------------------- Projects --------------------
\\section{{PROJECTS}}
\\begin{{itemize}}[leftmargin=1.2em, itemsep=4pt]

[Select ONLY 2-4 projects most relevant to the job. For each:]
\\item \\textbf{{Project Name}} \\href{{github-url}}{{\\faGithub}}\\\\
[Description emphasizing technologies matching job requirements]\\\\
\\textbf{{Technologies:}} [List technologies, highlighting job-relevant ones]

\\end{{itemize}}

% -------------------- Certifications --------------------
\\section{{AWARDS AND CERTIFICATES}}
\\begin{{itemize}}[leftmargin=1.5em, itemsep=2pt, nosep]
[For each certification:]
    \\item \\textbf{{Certification Name}} (Issuer) \\href{{url}}{{\\faLink}}
\\end{{itemize}}

\\end{{document}}

CRITICAL INSTRUCTIONS:
1. Use EXACTLY this template structure - same packages, same colors, same section order
2. DO NOT change package declarations or color definitions
3. Tailor CONTENT to job while keeping STRUCTURE identical
4. Professional Summary: Write NEW summary for this specific role
5. Skills: Organize into exact 5 categories shown, prioritize job-relevant skills
6. Projects: Select 2-4 MOST RELEVANT projects only, not all projects
7. Keep formatting: fontawesome5 icons, tabularx for education, itemize for lists
8. Return ONLY the LaTeX code, no markdown blocks, no explanations"""

        try:
            print("=" * 80)
            print("GENERATING RESUME WITH GROQ LLM...")
            print(f"Job: {job_data.get('job_title')} at {job_data.get('company_name')}")
            print(f"Profile has {len(profile.get('projects', []))} projects")
            print("=" * 80)
            
            latex_content = await self.generate_text(prompt, max_tokens=4000)
            
            # Strip markdown code blocks if present
            if latex_content.strip().startswith('```'):
                # Extract content between ```latex and ```
                latex_match = re.search(r'```(?:latex)?\s*\n(.*?)\n```', latex_content, re.DOTALL)
                if latex_match:
                    latex_content = latex_match.group(1).strip()
                else:
                    # Try to strip just the backticks
                    latex_content = latex_content.strip().strip('`').strip()
            
            print("=" * 80)
            print("GROQ LLM RESPONSE RECEIVED")
            print(f"Response length: {len(latex_content)} characters")
            
            # Check if starts with documentclass (can't use backslash in f-string)
            starts_with_doc = latex_content.strip().startswith('\\documentclass')
            print(f"Starts with \\documentclass: {starts_with_doc}")
            print(f"First 200 chars: {latex_content[:200]}")
            print("=" * 80)
            
            # Ensure it starts with LaTeX document class
            if not starts_with_doc:
                print("⚠️ WARNING: LLM response doesn't start with \\documentclass, using fallback template")
                # Use fallback template
                return self._get_professional_latex_template(profile, job_data)
            
            print("✅ Using Groq LLM-generated resume content")
            return latex_content
        except Exception as e:
            print(f"❌ Resume generation error: {e}")
            # Return professional template on error
            return self._get_professional_latex_template(profile, job_data)
    
    def _format_education(self, education: List[Dict]) -> str:
        """Format education entries for prompt"""
        if not education:
            return "No education data provided"
        
        result = []
        for edu in education:
            entry = f"- {edu.get('degree', 'Degree')} in {edu.get('field', 'Field')}"
            entry += f" from {edu.get('university', 'University')}"
            if edu.get('location'):
                entry += f", {edu['location']}"
            if edu.get('start_year') and edu.get('end_year'):
                entry += f" ({edu['start_year']} - {edu['end_year']})"
            if edu.get('gpa'):
                entry += f", GPA: {edu['gpa']}"
            if edu.get('achievements'):
                entry += f"\n  Achievements: {', '.join(edu['achievements'])}"
            result.append(entry)
        return '\n'.join(result)
    
    def _format_experience(self, experience: List[Dict]) -> str:
        """Format experience entries for prompt"""
        if not experience:
            return "No work experience provided"
        
        result = []
        for exp in experience:
            entry = f"- {exp.get('title', 'Position')} at {exp.get('company', 'Company')}"
            if exp.get('location'):
                entry += f", {exp['location']}"
            entry += f" ({exp.get('start_date', 'Start')} - {exp.get('end_date', 'Present' if exp.get('is_current') else 'End')})"
            if exp.get('achievements'):
                entry += "\n  Achievements:\n  " + '\n  '.join([f"• {ach}" for ach in exp['achievements']])
            if exp.get('technologies'):
                entry += f"\n  Technologies: {', '.join(exp['technologies'])}"
            result.append(entry)
        return '\n'.join(result)
    
    def _format_projects(self, projects: List[Dict]) -> str:
        """Format project entries for prompt"""
        if not projects:
            return "No projects provided"
        
        result = []
        for proj in projects:
            entry = f"- {proj.get('name', 'Project Name')}"
            if proj.get('link') or proj.get('github'):
                entry += f" (Link: {proj.get('link') or proj.get('github')})"
            entry += f"\n  {proj.get('description', 'Description')}"
            if proj.get('technologies'):
                entry += f"\n  Technologies: {', '.join(proj['technologies'])}"
            result.append(entry)
        return '\n'.join(result)
    
    def _format_certifications(self, certifications: List[Dict]) -> str:
        """Format certification entries for prompt"""
        if not certifications:
            return "No certifications provided"
        
        result = []
        for cert in certifications:
            entry = f"- {cert.get('name', 'Certification')} from {cert.get('issuer', 'Issuer')}"
            if cert.get('date'):
                entry += f" ({cert['date']})"
            if cert.get('credential_url'):
                entry += f" - {cert['credential_url']}"
            result.append(entry)
        return '\n'.join(result)
    
    async def optimize_resume(
        self,
        current_resume: str,
        ats_feedback: Dict[str, Any]
    ) -> str:
        """
        Optimize resume based on ATS feedback
        
        Args:
            current_resume: Current resume LaTeX content
            ats_feedback: ATS analysis feedback
            
        Returns:
            Optimized LaTeX resume
        """
        prompt = f"""Improve this resume based on ATS feedback to increase the ATS score.

Current Resume:
{current_resume[:3000]}

ATS Feedback:
- Current Score: {ats_feedback.get('ats_score', 0)}%
- Missing Keywords: {', '.join(ats_feedback.get('missing_keywords', [])[:10])}
- Suggestions: {', '.join(ats_feedback.get('suggestions', [])[:5])}

Optimize the resume by:
1. Incorporating missing keywords naturally into relevant sections
2. Improving keyword density without keyword stuffing
3. Enhancing relevant sections (experience, projects, skills)
4. Maintaining professional tone and LaTeX formatting
5. Keeping all existing content structure

Return the complete optimized LaTeX document."""
        
        try:
            optimized = await self.generate_text(prompt, max_tokens=4000)
            return optimized if optimized.strip().startswith('\\documentclass') else current_resume
        except Exception as e:
            print(f"Optimization error: {e}")
            return current_resume
    
    async def generate_cover_letter_content(
        self,
        profile: Dict[str, Any],
        job_data: Dict[str, Any]
    ) -> str:
        """
        Generate a tailored cover letter for a job application
        
        Args:
            profile: User profile data
            job_data: Job requirements data
            
        Returns:
            Cover letter content as plain text
        """
        # Extract skills from job_data
        required_skills = job_data.get('skills_required', [])
        preferred_skills = job_data.get('preferred_skills', [])
        all_job_skills = required_skills + preferred_skills
        
        # Get candidate skills - handle empty case
        candidate_skills = profile.get('skills', [])
        skills_text = ', '.join(candidate_skills[:20]) if candidate_skills else 'software development, problem-solving, and teamwork'
        
        # Format experience for the prompt
        experience_text = self._format_experience(profile.get('experience', []))
        projects_text = self._format_projects(profile.get('projects', []))
        
        # Get job skills text
        job_skills_text = ', '.join(all_job_skills[:15]) if all_job_skills else 'various technical skills'
        requirements_text = ', '.join(job_data.get('requirements', [])[:8]) if job_data.get('requirements') else 'as specified in the job posting'
        
        # Format education for the prompt
        education_text = self._format_education(profile.get('education', []))
        
        # Build comprehensive prompt with SWE-specific elements
        prompt = f"""You are an expert cover letter writer specializing in Software Engineering roles at top tech companies. Write a compelling, professional cover letter for the following job application.

=== JOB DETAILS ===
Position: {job_data.get('job_title', 'Software Engineer')}
Company: {job_data.get('company_name', 'the company')}
Required Skills: {job_skills_text}
Key Requirements: {requirements_text}
Job Description Summary: {job_data.get('job_description', 'A challenging role requiring technical expertise')[:1500]}

=== CANDIDATE INFORMATION ===
Full Name: {profile.get('full_name', 'The Candidate')}
Email: {profile.get('email', 'candidate@email.com')}
Phone: {profile.get('phone', '')}
Location: {profile.get('location', '')}
Professional Summary: {profile.get('summary', 'A motivated professional seeking new opportunities')}
Technical Skills (Tech Stack): {skills_text}

Education Background:
{education_text if education_text != "No education data provided" else "Computer Science/Engineering background"}

Work Experience:
{experience_text if experience_text != "No work experience provided" else "Entry-level candidate with strong academic background"}

Relevant Projects:
{projects_text if projects_text != "No projects provided" else "Various academic and personal projects demonstrating technical skills"}

=== COVER LETTER INSTRUCTIONS FOR STRONG SWE APPLICATIONS ===
Write a professional cover letter that MUST include these key elements:

**1. DEGREE + SPECIALIZATION (Opening paragraph):**
- Mention the candidate's degree (CS/Engineering) and any specialization
- State enthusiasm for the specific role and company

**2. STANDOUT PROJECTS (1-2 projects highlighted):**
- Choose the 1-2 most impressive projects from their profile
- Describe what was built and the technical challenges solved
- Mention specific technologies used (tech stack)

**3. TECHNICAL DEPTH (Problem Solving / Algorithms / ML / Systems):**
- Highlight any experience with:
  - Data structures & algorithms
  - Machine learning or AI projects
  - Systems design or distributed systems
  - Backend/frontend architecture
- Show problem-solving abilities with concrete examples

**4. IMPACT & RESULTS:**
- Quantify achievements where possible (e.g., "reduced latency by 40%", "served 10K users")
- Show measurable outcomes from projects or work experience

**5. ALIGNMENT WITH COMPANY TEAMS:**
- For companies like Google, mention interest in specific areas:
  - AI/ML teams, Infrastructure, Cloud, Data Engineering, Search, etc.
- Show how the candidate's work aligns with the company's mission
- Demonstrate knowledge of the company's products/technologies

**6. CLOSING:**
- Strong call to action
- Express eagerness for technical discussion

=== ADDITIONAL REQUIREMENTS ===
- Length: 350-400 words (4 paragraphs max)
- Tone: Professional, confident, but not arrogant
- Use the candidate's ACTUAL name ({profile.get('full_name', 'Candidate')}) - NO placeholders
- Be specific about technical skills, not generic

=== OUTPUT FORMAT ===
Write the cover letter starting with "Dear Hiring Manager," and ending with the candidate's contact info.
Do NOT include any meta-commentary, just the cover letter text itself."""

        try:
            print("=" * 80)
            print("GENERATING COVER LETTER WITH GROQ LLM...")
            print(f"Job: {job_data.get('job_title')} at {job_data.get('company_name')}")
            print(f"Candidate: {profile.get('full_name')}")
            print(f"Skills count: {len(candidate_skills)}")
            print("=" * 80)
            
            cover_letter = await self.generate_text(prompt, max_tokens=2000)
            
            # Validate the response
            if cover_letter and len(cover_letter) > 100:
                print("=" * 80)
                print("✅ COVER LETTER GENERATED SUCCESSFULLY")
                print(f"Length: {len(cover_letter)} characters")
                print("=" * 80)
                return cover_letter.strip()
            else:
                print("⚠️ LLM response too short, using fallback")
                return self._get_fallback_cover_letter(profile, job_data)
            
        except Exception as e:
            print(f"❌ Cover letter generation error: {e}")
            import traceback
            traceback.print_exc()
            # Return a basic template on error
            return self._get_fallback_cover_letter(profile, job_data)
    
    def _get_fallback_cover_letter(self, profile: Dict[str, Any], job_data: Dict[str, Any]) -> str:
        """Fallback cover letter template when LLM fails - SWE-focused version"""
        # Get values with proper defaults
        full_name = profile.get('full_name') or 'Candidate'
        email = profile.get('email') or ''
        phone = profile.get('phone') or ''
        job_title = job_data.get('job_title') or 'the position'
        company_name = job_data.get('company_name') or 'your company'
        
        # Handle skills - ensure we have something to show
        skills = profile.get('skills', [])
        if skills and len(skills) > 0:
            skills_text = ', '.join(skills[:8])
        else:
            skills_text = 'Python, JavaScript, data structures, algorithms, and software development'
        
        # Get education info for degree + specialization
        education = profile.get('education', [])
        degree_text = ""
        if education and len(education) > 0:
            edu = education[0]
            degree = edu.get('degree', 'degree')
            field = edu.get('field', 'Computer Science')
            university = edu.get('university', 'my university')
            degree_text = f"As a {degree} graduate in {field} from {university}, I am"
        else:
            degree_text = "With a strong background in Computer Science, I am"
        
        # Build projects text with tech stack - highlight 1-2 standout projects
        projects = profile.get('projects', [])
        projects_paragraph = ""
        if projects and len(projects) > 0:
            proj1 = projects[0]
            proj1_name = proj1.get('name', 'a technical project')
            proj1_tech = ', '.join(proj1.get('technologies', ['various technologies'])[:3])
            proj1_desc = proj1.get('description', 'solving complex technical challenges')[:100]
            
            projects_paragraph = f"\n\nOne of my standout projects is {proj1_name}, where I utilized {proj1_tech} to build a solution for {proj1_desc}. "
            
            if len(projects) > 1:
                proj2 = projects[1]
                proj2_name = proj2.get('name', 'another project')
                proj2_tech = ', '.join(proj2.get('technologies', [])[:3])
                projects_paragraph += f"Additionally, I developed {proj2_name} using {proj2_tech}, demonstrating my ability to design and implement robust systems."
        
        # Build experience text if available
        experience = profile.get('experience', [])
        experience_paragraph = ""
        if experience and len(experience) > 0:
            exp = experience[0]
            exp_title = exp.get('title', 'my previous role')
            exp_company = exp.get('company', 'my previous organization')
            exp_tech = ', '.join(exp.get('technologies', [])[:4]) if exp.get('technologies') else 'various technologies'
            experience_paragraph = f" In my role as {exp_title} at {exp_company}, I worked with {exp_tech}, developing solutions that improved team efficiency and system reliability."
        
        # Determine team alignment based on job title and skills
        team_alignment = ""
        job_title_lower = job_title.lower()
        if 'ml' in job_title_lower or 'machine learning' in job_title_lower or 'ai' in job_title_lower:
            team_alignment = "I am particularly excited about the opportunity to contribute to AI/ML initiatives"
        elif 'backend' in job_title_lower or 'infrastructure' in job_title_lower or 'systems' in job_title_lower:
            team_alignment = "I am particularly excited about the opportunity to work on infrastructure and systems challenges"
        elif 'data' in job_title_lower:
            team_alignment = "I am particularly excited about the opportunity to work on data engineering and analytics"
        elif 'cloud' in job_title_lower:
            team_alignment = "I am particularly excited about the opportunity to contribute to cloud platform development"
        else:
            team_alignment = "I am particularly excited about the opportunity to contribute to innovative technical projects"
        
        return f"""Dear Hiring Manager,

{degree_text} writing to express my enthusiastic interest in the {job_title} position at {company_name}. With a strong foundation in data structures, algorithms, and systems design, I am confident in my ability to contribute meaningfully to your engineering team.{experience_paragraph}

My technical expertise includes {skills_text}. Through my academic and personal projects, I have developed strong problem-solving skills and a deep understanding of software development best practices.{projects_paragraph}

{team_alignment} at {company_name}. I am drawn to the company's commitment to technical excellence and innovation. I believe my combination of technical skills, project experience, and passion for building scalable solutions makes me a strong fit for this role.

I would welcome the opportunity to discuss how my background in algorithms, systems design, and hands-on project experience can contribute to {company_name}'s mission. Thank you for considering my application. I look forward to the possibility of speaking with you soon.

Sincerely,
{full_name}
{email}
{phone}"""
    
    def _get_professional_latex_template(self, profile: Dict[str, Any], job_data: Dict[str, Any]) -> str:
        """Professional LaTeX template fallback"""
        skills = profile.get('skills', [])
        education = profile.get('education', [])
        experience = profile.get('experience', [])
        projects = profile.get('projects', [])
        certifications = profile.get('certifications', [])
        
        # Format education section
        edu_section = ""
        for edu in education[:3]:
            edu_section += f"""\\textbf{{{edu.get('university', 'University')}, {edu.get('location', 'Location')}}} & \\textbf{{{edu.get('start_year', 'Year')} -- {edu.get('end_year', 'Year')}}}\\\\
{edu.get('degree', 'Degree')} in {edu.get('field', 'Field')} & \\textit{{GPA: {edu.get('gpa', 'N/A')}}} \\\\[4pt]

"""
        
        # Format projects section
        proj_section = ""
        for proj in projects[:3]:
            github_link = f" \\href{{{proj.get('github', '#')}}}{{\\faGithub}}" if proj.get('github') else ""
            proj_section += f"""\\item \\textbf{{{proj.get('name', 'Project')}}}{github_link}\\\\
{proj.get('description', 'Description')}\\\\
\\textbf{{Technologies:}} {', '.join(proj.get('technologies', [])[:5])}

"""
        
        # Format certifications section
        cert_section = ""
        for cert in certifications[:5]:
            link = f" \\href{{{cert.get('credential_url', '#')}}}{{\\faLink}}" if cert.get('credential_url') else ""
            cert_section += f"    \\item \\textbf{{{cert.get('name', 'Certification')}}} ({cert.get('issuer', 'Issuer')}){link}\n"
        
        return f"""\\documentclass[a4paper,10pt]{{article}}

% -------------------- Packages --------------------
\\usepackage[unicode, draft=false]{{hyperref}}
\\hypersetup{{
    hidelinks,
    colorlinks=false,
    pdfborder={{0 0 0}}
}}
\\usepackage{{fontawesome5}}
\\usepackage{{parskip}}
\\usepackage{{xcolor}}
\\usepackage[scale=0.9, top=0.5in, bottom=0.5in, left=0.5in, right=0.5in]{{geometry}}
\\usepackage{{tabularx}}
\\usepackage{{enumitem}}
\\usepackage{{titlesec}}

% -------------------- Customizations --------------------
\\definecolor{{PrimaryColor}}{{HTML}}{{1C033C}}
\\definecolor{{SecondaryColor}}{{HTML}}{{371e77}}

\\titleformat{{\\section}}{{\\large\\scshape\\raggedright}}{{}}{{0em}}{{}}[\\titlerule]
\\titlespacing{{\\section}}{{0pt}}{{8pt}}{{4pt}}

\\pagestyle{{empty}}

% -------------------- Document --------------------
\\begin{{document}}

% -------------------- Header --------------------
\\begin{{center}}
    \\color{{PrimaryColor}}
    \\Huge\\textbf{{{profile.get('full_name', 'YOUR NAME')}}}\\\\[6pt]
    \\normalsize
    \\color{{SecondaryColor}}
    \\underline{{\\faEnvelope}} \\href{{mailto:{profile.get('email', 'email@example.com')}}}{{{profile.get('email', 'email@example.com')}}} \\quad
    \\underline{{\\faMobile}} {profile.get('phone', '+91 XXXXXXXXXX')} \\\\[3pt]
    \\underline{{\\faGithub}} \\href{{{profile.get('github', '#')}}}{{{profile.get('github', 'github.com/username')}}} \\quad
    \\underline{{\\faLinkedin}} \\href{{{profile.get('linkedin', '#')}}}{{{profile.get('linkedin', 'linkedin.com/in/profile')}}}
\\end{{center}}

% -------------------- Profile --------------------
\\section*{{PROFILE}}
{profile.get('summary', 'Professional summary highlighting key strengths and career focus.')}

% -------------------- Skills --------------------
\\section{{SKILLS}}
\\begin{{itemize}}[leftmargin=1.5em, itemsep=2pt, nosep]
    \\item \\textbf{{Technical Skills:}} {', '.join(skills[:15])}
\\end{{itemize}}

% -------------------- Education --------------------
\\section*{{EDUCATION}}
\\begin{{tabularx}}{{\\textwidth}}{{X r}}
{edu_section}
\\end{{tabularx}}

% -------------------- Projects --------------------
\\section{{PROJECTS}}
\\begin{{itemize}}[leftmargin=1.2em, itemsep=4pt]
{proj_section}
\\end{{itemize}}

% -------------------- Certifications --------------------
\\section{{CERTIFICATIONS}}
\\begin{{itemize}}[leftmargin=1.5em, itemsep=2pt, nosep]
{cert_section}
\\end{{itemize}}

% -------------------- Target Role --------------------
\\section*{{TARGET ROLE}}
Applying for: {job_data.get('job_title', 'Position')} at {job_data.get('company_name', 'Company')}

\\end{{document}}"""

    async def analyze_skill_gap(
        self,
        profile: Dict[str, Any],
        job_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Perform comprehensive skill gap analysis between candidate profile and job requirements
        """
        required_skills = job_data.get('skills_required', [])
        preferred_skills = job_data.get('preferred_skills', [])
        all_job_skills = required_skills + preferred_skills
        
        candidate_skills = profile.get('skills', [])
        skills_text = ', '.join(candidate_skills[:30]) if candidate_skills else 'No skills listed'
        
        education_text = self._format_education(profile.get('education', []))
        experience_text = self._format_experience(profile.get('experience', []))
        projects_text = self._format_projects(profile.get('projects', []))
        
        prompt = f"""You are an expert career coach and technical skills assessor. Perform a comprehensive skill gap analysis.

=== JOB REQUIREMENTS ===
Position: {job_data.get('job_title', 'Software Engineer')}
Company: {job_data.get('company_name', 'Tech Company')}
Required Skills: {', '.join(required_skills[:15]) if required_skills else 'Not specified'}
Preferred Skills: {', '.join(preferred_skills[:15]) if preferred_skills else 'Not specified'}
Requirements: {', '.join(job_data.get('requirements', [])[:8]) if job_data.get('requirements') else 'As per job description'}
Job Description: {job_data.get('job_description', '')[:1500]}

=== CANDIDATE PROFILE ===
Skills: {skills_text}
Education: {education_text}
Experience: {experience_text}
Projects: {projects_text}

Return a JSON object:
{{
    "match_percentage": <0-100>,
    "matching_skills": ["skills candidate has that match"],
    "missing_skills": ["required skills candidate lacks"],
    "strengths": [{{"skill": "name", "level": "Expert/Advanced/Intermediate", "evidence": "from profile"}}],
    "priority_gaps": [{{"skill": "name", "priority": "Critical/High/Medium", "reason": "why important", "time_to_learn": "X weeks"}}],
    "recommendations": [{{"type": "Training/Certification/Project", "title": "specific recommendation", "description": "details", "resource": "platform", "duration": "time"}}],
    "certifications_suggested": [{{"name": "cert name", "provider": "provider", "relevance": "why relevant", "cost": "$XXX", "duration": "time"}}],
    "training_courses": [{{"name": "course", "platform": "Coursera/Udemy", "url": "course URL", "skill_covered": "skill", "duration": "hours"}}],
    "learning_roadmap": "A detailed 3-6 month learning roadmap"
}}

Be specific. Use real course names and platforms. Return ONLY valid JSON."""
        
        try:
            print("=" * 80)
            print("PERFORMING GAP ANALYSIS WITH GROQ LLM...")
            print(f"Job: {job_data.get('job_title')} at {job_data.get('company_name')}")
            print("=" * 80)
            
            response = await self.generate_text(prompt, max_tokens=3000)
            
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                result = json.loads(response)
            
            result["match_percentage"] = max(0, min(100, result.get("match_percentage", 50)))
            result.setdefault("matching_skills", [])
            result.setdefault("missing_skills", [])
            result.setdefault("strengths", [])
            result.setdefault("priority_gaps", [])
            result.setdefault("recommendations", [])
            result.setdefault("certifications_suggested", [])
            result.setdefault("training_courses", [])
            result.setdefault("learning_roadmap", self._get_fallback_roadmap(result.get("missing_skills", [])))
            
            print(f"✅ GAP ANALYSIS COMPLETED - Match: {result['match_percentage']}%")
            return result
            
        except Exception as e:
            print(f"❌ Gap analysis error: {e}")
            return self._get_fallback_gap_analysis(candidate_skills, all_job_skills, job_data)
    
    def _get_fallback_gap_analysis(self, candidate_skills: List[str], job_skills: List[str], job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback gap analysis when LLM fails"""
        candidate_lower = [s.lower() for s in candidate_skills]
        matching = [s for s in job_skills if any(s.lower() in c or c in s.lower() for c in candidate_lower)]
        missing = [s for s in job_skills if s not in matching]
        match_pct = int((len(matching) / max(len(job_skills), 1)) * 100) if job_skills else 50
        
        return {
            "match_percentage": match_pct,
            "matching_skills": matching[:10],
            "missing_skills": missing[:10],
            "strengths": [{"skill": s, "level": "Intermediate", "evidence": "Listed in profile"} for s in matching[:5]],
            "priority_gaps": [{"skill": s, "priority": "High", "reason": "Required for role", "time_to_learn": "2-4 weeks"} for s in missing[:5]],
            "recommendations": [{"type": "Training", "title": f"Learn {missing[0] if missing else 'new skills'}", "description": "Take an online course", "resource": "Coursera/Udemy", "duration": "4-6 weeks"}] if missing else [],
            "certifications_suggested": [{"name": "AWS/GCP Certification", "provider": "Cloud Provider", "relevance": "Industry standard", "cost": "$150-300", "duration": "2-3 months"}],
            "training_courses": [{"name": f"{missing[0] if missing else 'Programming'} Course", "platform": "Udemy", "url": "udemy.com", "skill_covered": missing[0] if missing else "Programming", "duration": "20-40 hours"}],
            "learning_roadmap": self._get_fallback_roadmap(missing)
        }
    
    def _get_fallback_roadmap(self, missing_skills: List[str]) -> str:
        """Generate a basic learning roadmap"""
        if not missing_skills:
            return "Continue building on your current skills through challenging projects and staying updated with industry trends."
        skills = missing_skills[:5]
        return f"""**Phase 1 (Weeks 1-4): Foundation**
- Learn: {skills[0] if skills else 'core skills'}
- Complete an online course and build a practice project

**Phase 2 (Weeks 5-8): Development**  
- Learn: {skills[1] if len(skills) > 1 else 'advanced concepts'}
- Work on hands-on exercises and contribute to open-source

**Phase 3 (Weeks 9-12): Advanced Application**
- Master: {', '.join(skills[2:4]) if len(skills) > 2 else 'integration and best practices'}
- Build a comprehensive portfolio project

**Phase 4 (Ongoing): Continuous Improvement**
- Pursue certifications and stay updated with trends"""


# Global instance
llm_service = LLMService()

