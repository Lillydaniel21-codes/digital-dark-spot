# Digital Dark Spot – Technical Architecture & Project Overview

**Project Subtitle:** AI-Assisted Information Gap Detection Platform

## Executive Summary
Digital Dark Spot is an AI-powered intelligence platform engineered to help individuals and organizations make informed decisions by illuminating what information is **missing**, **conflicting**, or **outdated** across multiple sources.

While conventional search engines and LLM chat wrappers summarize only what is explicitly written in retrieved documents, Digital Dark Spot performs rigorous cross-examination to uncover omissions, contradictory claims, and unverified assumptions.

---

## The Core Problem
Online information across education, scholarships, job opportunities, visa procedures, and business contracts is notoriously:
1. **Incomplete**: Important renewal conditions, deadlines, or fees are left unstated.
2. **Conflicting**: Different regional notices or web pages present opposing rules.
3. **Outdated**: Expired cycles and past requirements continue to circulate without warning.
4. **Unverifiable**: Information lack traceable evidence or primary contact channels.

---

## 15-Step Gap Detection Pipeline
Digital Dark Spot implements a systematic, deterministic and AI-augmented 15-step pipeline:
1. **Inquiry Intake**: Accepts research title, question, topic domain, and research goals.
2. **Multi-Source Extraction**: Secure ingestion of PDF, Word (DOCX), plain text, and web URLs with SSRF protection.
3. **Normalization**: Strips noise, script tags, and non-printable characters.
4. **Semantic Chunking**: Segments text into ~400-word chunks with overlap.
5. **Traceable Citations**: Retains source metadata and assigns immutable citation IDs (`SRC-001`, `SRC-002`, etc.).
6. **Dynamic Taxonomy Generation**: Derives domain-specific expected criteria (e.g. Eligibility, Deadlines, Renewal Terms, Fee Schedules).
7. **Cross-Source Evaluation**: Evaluates whether expected criteria are present, partially present, or absent.
8. **Missing Information Classification**: Strictly classifies omissions as `"Not found in sources reviewed"` to avoid false assumptions.
9. **Contradiction Detection**: Pairs contrasting statements from different sources, assessing possible root causes.
10. **Outdated Information Warning**: Scans publication dates and cycle years to flag stale temporal data.
11. **Unanswered Question Synthesis**: Highlights critical unresolved questions with recommended sources.
12. **Verification Checklist Generation**: Produces a prioritized, actionable checklist with completion toggles.
13. **Database Persistence**: Stores all entities via SQLAlchemy ORM (SQLite/PostgreSQL compatible).
14. **Context-Grounded Retrieval**: Supplies structured findings and chunks to the AI Research Assistant.
15. **Report Generation**: Produces printable audits and downloadable ReportLab PDFs.

---

## Grounded AI Assistant
The integrated conversational assistant uses retrieval-augmented generation grounded strictly in reviewed sources. If an inquiry cannot be corroborated by the source materials, it responds:
> *"I could not find sufficient evidence in the sources reviewed to answer this question."*
and suggests direct verification steps.

---

## Technology Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons, Recharts.
- **Backend**: Python 3.11, FastAPI, Pydantic v2, SQLAlchemy ORM, Uvicorn.
- **Document Processing**: `pypdf`, `python-docx`, `beautifulsoup4`, `requests` with SSRF protection.
- **Reporting**: ReportLab PDF generator.
- **AI Integration**: Configurable Google Gemini / OpenAI with seamless deterministic demo fallback.
