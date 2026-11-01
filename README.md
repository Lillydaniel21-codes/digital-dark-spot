# Digital Dark Spot – AI-Assisted Information Gap Detection Platform

> **"Discover What Information Is Missing."**  
> Analyze multiple sources, uncover conflicting claims, identify critical information gaps, and know exactly what to verify next.

---

## 1. Problem Statement
In an era of information saturation, individuals and organizations rely heavily on online sources to make critical life decisions—such as applying for competitive scholarships, evaluating career opportunities, navigating government services, and entering legal contracts. 

However, available online data is frequently:
- **Incomplete**: Crucial conditions, retention GPA rules, or renewal obligations are unstated.
- **Conflicting**: Different regional notices or web portals present opposing deadlines or transcript requirements.
- **Outdated**: Expired academic cycles and historical fee schedules circulate without warnings.
- **Unverifiable**: Information lack traceable evidence or primary institutional contact channels.

Most conventional search engines and LLM chat wrappers summarize only what is explicitly written in retrieved documents. They suffer from the **"presence bias"**: if a critical detail was omitted by the source, the user remains unaware of the blind spot.

---

## 2. Proposed Solution
**Digital Dark Spot** is a full-stack, AI-assisted information gap detection platform engineered to solve this challenge. Rather than merely summarizing what exists, Digital Dark Spot systematically executes a **15-step cross-source gap detection pipeline**:
1. Accepts user inquiry (e.g. *"What should I verify before applying for this scholarship?"*).
2. Securely ingests multi-format sources (PDF guidelines, Word DOCX documents, TXT, and live web URLs with SSRF protection).
3. Normalizes and chunks text while preserving traceable citation IDs (`SRC-001`, `SRC-002`, `SRC-003`).
4. Dynamically generates expected domain categories (e.g. Eligibility, Deadlines, Renewal Terms, Required Documents, Official Portals).
5. Cross-examines content across sources to detect:
   - **Missing Information**: Explicitly categorized as `"Not found in sources reviewed"` to avoid false assumptions.
   - **Conflicting Claims**: Pairs contrasting statements side-by-side with root cause analysis.
   - **Potentially Outdated Details**: Identifies stale calendar dates or historical academic cycles.
   - **Unanswered Questions**: Flags unaddressed operational questions.
   - **Prioritized Verification Checklist**: Interactive checklist with priority ratings and completion toggles.
6. Integrates a **Grounded AI Research Assistant Chatbot** that provides citation-backed answers and clearly admits when evidence was not found in the reviewed materials.
7. Produces downloadable ReportLab PDF audit reports for offline verification.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Data Visualization**: Recharts & Custom SVG Topology Visuals
- **Architecture**: Modular pages, reusable design system, responsive design for desktop/tablet/mobile

### Backend
- **API Framework**: Python 3.11 with FastAPI
- **Data Validation**: Pydantic v2
- **ORM & Database**: SQLAlchemy ORM with SQLite (PostgreSQL compatible schema)
- **Document Processing**: `pypdf`, `python-docx`, `beautifulsoup4`, `requests` with SSRF protection
- **Report Generation**: ReportLab PDF generator
- **Server**: Uvicorn ASGI server

### AI Integration
- **Configurable Provider**: Configurable for Google Gemini API (`GEMINI_API_KEY`) and OpenAI
- **Local Deterministic Fallback Engine**: When API keys are not supplied, the platform executes a 15-step deterministic extraction and gap detection pipeline labeled clearly as Demo Mode, ensuring 100% operational reliability without third-party dependencies.

---

## 4. System Architecture
```
                         [ User Research Inquiry ]
                                    │
                                    ▼
               [ Multi-Source Document & URL Ingestion ]
           (PDF, DOCX, TXT, Web Scraper with SSRF Protection)
                                    │
                                    ▼
                 [ Text Cleaning, Normalization & Chunking ]
                        (Assigns SRC-001, SRC-002...)
                                    │
                                    ▼
                 [ Dynamic Domain Category Generator ]
         (Derives Expected Taxonomy: Deadlines, Eligibility, Renewal...)
                                    │
                                    ▼
                ┌───────────────────┴───────────────────┐
                ▼                                       ▼
    [ Information Gap Detector ]            [ Contradiction & Outdated Engine ]
  ("Not found in sources reviewed")        (Claim A vs Claim B, Stale Cycles)
                └───────────────────┬───────────────────┘
                                    │
                                    ▼
                    [ Key Findings & Traceable Citations ]
                        (Strength: Strong / Moderate)
                                    │
                                    ▼
             ┌──────────────────────┴──────────────────────┐
             ▼                                             ▼
[ Prioritized Verification Checklist ]         [ Grounded AI Assistant ]
(Action Items with Toggleable Status)         (RAG with Exact Citations)
             │                                             │
             └──────────────────────┬──────────────────────┘
                                    │
                                    ▼
                [ PDF Audit Report (ReportLab) & JSON API ]
```

---

## 5. Getting Started & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend Setup
```bash
# From the project root:
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API documentation will be available at:
- Swagger UI: `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/api/health`

### 2. Frontend Setup
```bash
# Open a new terminal in the project root:
cd frontend

# Install dependencies (if not already installed)
npm install

# Start the Vite development server
npm run dev
```
The frontend application will be running at:
- Web Application: `http://localhost:5173`

---

## 6. Environment Configuration (`.env`)
Create a `.env` file in the root directory or configure environment variables:
```ini
# AI Provider (Optional: if empty, local deterministic demo mode is active)
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=
AI_MODEL=gemini-2.5-flash

# Database URL (Default: SQLite; PostgreSQL ready)
DATABASE_URL=sqlite:///./digital_dark_spot.db

# Security
SECRET_KEY=digital-dark-spot-super-secret-key-2026-development

# SMTP Email (Optional: for real email OTP delivery)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAILS_FROM_EMAIL=
```

---

## 7. Authentication Workflow
- **Passwordless Authentication**: Users enter their email address.
- **One-Time Passcode (OTP)**: If an SMTP email provider is configured, a 6-digit verification code is delivered via email.
- **Local Demo Access**: When no email provider is configured, the system provides transparent local demo access with 1-click instant login or displays the verification code directly, ensuring seamless and frictionless testing.

---

## 8. Built-in Sample Benchmark: "Scholarship Application Verification"
To immediately experience the platform's capabilities without manually uploading documents:
1. Click **"Explore Demo Access"** or **"Load Sample Research"** from the navigation bar or dashboard.
2. The platform automatically seeds 3 realistic, heterogeneous sources:
   - `SRC-001`: *Global Future Scholars Official Guidelines (2025/2026)*
   - `SRC-002`: *Regional Education Board Scholarship Notice (2024)*
   - `SRC-003`: *Student Financial Aid Advisory Forum & Experience Post*
3. Explore the pre-computed analysis:
   - **Gaps**: Exposes missing renewal criteria and retention GPA thresholds.
   - **Conflicts**: Highlights transcript requirements conflict (official sealed registrar copy vs unofficial student PDF).
   - **Outdated Data**: Flags expired 2024 deadlines in regional state notices.
   - **Checklist**: Prioritized actions to resolve before applying.
   - **AI Assistant**: Ask questions like *"What renewal conditions are missing?"* or *"Explain the transcript conflict"*.

---

## 9. Testing & Quality Assurance
Run backend integration and unit tests:
```bash
# From project root:
python -m pytest backend/tests/test_api.py -v
```
All 5 automated test suites pass with 100% success rate:
- `test_health_check`: Verifies API connectivity and provider status.
- `test_auth_request_and_verify_code`: Validates passwordless OTP authentication.
- `test_demo_login`: Confirms 1-click frictionless local demo access.
- `test_ssrf_protection_on_sources`: Ensures private network IP access is blocked.
- `test_load_sample_research_and_pipeline`: End-to-end test of the gap detection engine, checklist toggling, chatbot retrieval, and PDF generation.

---

## 10. Container Deployment (Docker)
Run the complete application via Docker:
```bash
# Build and run container
docker compose up --build
```
Access the application at `http://localhost:8000`.

---

## 11. Known Limitations & Future Scope
- **Current Limitations**: Live web crawling requires publicly accessible pages without strict Cloudflare bot verification; audio/video transcription is not yet included in the document parser.
- **Future Scope**:
  - Semantic cross-lingual translation for foreign scholarship and immigration notices.
  - Integration with official university registrar and grant notification APIs.
  - Automated webhook alerts when monitored guideline URLs update their terms.
