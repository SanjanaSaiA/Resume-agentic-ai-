# ResumeAI - AI-Powered ATS Resume Generator

An intelligent resume generation system that creates job-tailored, ATS-optimized resumes using **Groq LLM** (Llama 3.3 70B). Generate professional LaTeX resumes customized for specific job postings with automatic keyword optimization and ATS scoring.

## 🚀 Features

### Core Capabilities
- **AI-Powered Resume Generation**: Uses Groq's Llama 3.3 70B model for intelligent content tailoring
- **Job-Specific Optimization**: Automatically selects relevant projects, skills, and experience based on job description
- **ATS Scoring**: Real-time compatibility scoring with keyword matching analysis
- **LaTeX Export**: Professional, compilable LaTeX output with customizable templates
- **URL Scraping**: Extract job details directly from job posting URLs
- **Multi-Agent System**: Specialized agents for job extraction, resume generation, and ATS scoring

### User Features
- **Profile Management**: Comprehensive profile with education, experience, projects, and certifications
- **Resume History**: Track all generated resumes with scores and keywords
- **LaTeX Viewer**: View and copy generated LaTeX code without downloading
- **Keyword Analysis**: See matched and missing keywords for optimization

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database**: SQLite with SQLAlchemy ORM
- **AI/ML**: Groq API (Llama 3.3 70B), OpenAI SDK
- **Web Scraping**: BeautifulSoup4, Requests
- **Authentication**: JWT tokens with bcrypt hashing

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **UI Components**: Lucide React icons, React Hot Toast

## 📋 Prerequisites

- **Python**: 3.10 or higher
- **Node.js**: 18 or higher
- **npm**: 9 or higher
- **Groq API Key**: Get from [console.groq.com](https://console.groq.com)

## 🔧 Installation

### 1. Clone Repository
```bash
git clone https://github.com/swaroopreddy07/resumeai.git
cd resumeai
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
copy .env.example .env
# Edit .env and add your GROQ_API_KEY

# Run migrations
python -m app.db.init_db

# Start backend server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
copy .env.local.example .env.local
# Edit .env.local if needed (default: http://localhost:8000)

# Start development server
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🎯 Usage

### 1. Create Account
- Navigate to http://localhost:3000/register
- Create account with email and password
- Login at http://localhost:3000/login

### 2. Setup Profile
- Go to **Profile** page
- Add your:
  - Personal information (name, email, phone, links)
  - Professional summary
  - Skills
  - Education
  - Work experience
  - Projects
  - Certifications

### 3. Generate Resume
- Go to **Resume Generator** page
- Choose input method:
  - **URL**: Paste job posting link
  - **Manual**: Enter job details directly
- Click **"Generate Optimized Resume"**
- Wait ~10-15 seconds for AI generation

### 4. Review Results
- **ATS Score**: Compatibility percentage (0-100)
- **Matched Keywords**: Keywords found in your resume
- **LaTeX Code**: Generated professional resume

### 5. Get PDF Resume
**Option 1: Overleaf (Recommended)**
1. Click **"Download LaTeX"**
2. Go to [Overleaf.com](https://www.overleaf.com) (free)
3. Create New Project → Upload `.tex` file
4. Click **"Recompile"**
5. Download PDF

**Option 2: Local Compilation**
1. Install [MiKTeX](https://miktex.org/download) or [TeX Live](https://www.tug.org/texlive/)
2. Download LaTeX file
3. Run: `pdflatex resume.tex`
4. Get PDF output

## 📁 Project Structure

```
resumeai/
├── backend/
│   ├── app/
│   │   ├── agents/          # AI agents (JD extractor, resume generator, ATS scorer)
│   │   ├── api/             # API routes
│   │   ├── db/              # Database setup
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic (LLM, web scraper)
│   │   ├── utils/           # Utilities (security, helpers)
│   │   └── main.py          # FastAPI app entry point
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts (Auth)
│   │   └── lib/             # API client
│   ├── package.json
│   └── .env.local.example
│
└── README.md
```

## 🔑 Environment Variables

### Backend (.env)
```env
# Required
GROQ_API_KEY=your_groq_api_key_here

# Optional
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///./resumeai.db
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🤖 AI Agents

### 1. JD Extractor Agent
- Extracts job details from URLs
- Parses job title, company, description
- Handles manual input fallback

### 2. Resume Generator Agent
- Orchestrates resume generation workflow
- Calls LLM service for content generation
- Enforces LaTeX template format

### 3. ATS Scorer Agent
- Analyzes resume against job description
- Calculates compatibility score
- Identifies matched and missing keywords

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Profile
- `GET /api/profile` - Get user profile
- `POST /api/profile` - Create profile
- `PUT /api/profile` - Update profile

### Resume
- `POST /api/resume/generate` - Generate resume
- `GET /api/resume/list` - List all resumes
- `GET /api/resume/{id}` - Get specific resume

## 🎨 Features in Detail

### LaTeX Template
- Professional single-column layout
- Custom color scheme
- Sections: Contact, Summary, Skills, Experience, Projects, Education, Certifications
- ATS-friendly formatting
- Hyperlinks for GitHub, LinkedIn, portfolio

### ATS Optimization
- Keyword extraction from job description
- Intelligent skill matching
- Project relevance scoring
- Experience tailoring
- Missing keyword identification

### Security
- JWT-based authentication
- Bcrypt password hashing
- Protected API routes
- User-specific data isolation

## 🐛 Troubleshooting

### Backend Issues
**Port 8000 already in use:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

**Database errors:**
```bash
# Reset database
rm resumeai.db
python -m app.db.init_db
```

### Frontend Issues
**Port 3000 already in use:**
```bash
# Change port in package.json
"dev": "next dev -p 3001"
```

**API connection errors:**
- Check backend is running on port 8000
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`

## 📝 License

This project is open source and available under the [MIT License](LICENSE).



## 🙏 Acknowledgments

- **Groq** for providing fast LLM inference
- **FastAPI** for the excellent Python web framework
- **Next.js** for the React framework
- **Overleaf** for free LaTeX compilation

## 🚀 Future Enhancements

- [ ] Cover letter generation
- [ ] Multiple resume templates
- [ ] Resume comparison tool
- [ ] Export to Word/PDF
- [ ] Interview preparation tips
- [ ] Job application tracking

---

