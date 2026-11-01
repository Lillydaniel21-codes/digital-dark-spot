import re
from typing import List, Dict, Any, Optional

def determine_domain_categories(question: str, topic: str = "", goal: str = "") -> List[Dict[str, str]]:
    """
    Dynamically generate expected information categories based on the user's research question,
    topic, and goal.
    """
    text = f"{question} {topic} {goal}".lower()
    
    # 1. Agriculture & Farming
    if any(k in text for k in ["farm", "farmer", "crop", "irrigation", "agriculture", "fertilizer", "soil", "kisan", "mandi", "harvest", "yield", "pesticide", "livestock"]):
        return [
            {
                "category": "Subsidy & Scheme Eligibility",
                "keywords": ["eligible", "eligibility", "land holding", "farmer", "aadhaar", "hectare", "criteria"],
                "importance": "Confirms landholding qualifications and citizen criteria before submitting grant or subsidy filings."
            },
            {
                "category": "Financial Disbursal & Subsidy Rates",
                "keywords": ["subsidy", "amount", "rate", "cost", "disbursement", "installment", "dbt", "bank"],
                "importance": "Clarifies actual government co-funding percentages versus out-of-pocket farmer capital requirements."
            },
            {
                "category": "Required Agro-Documentation",
                "keywords": ["land record", "khatoni", "patta", "documents", "aadhaar", "bank passbook", "noc"],
                "importance": "Missing revenue certificates or land title documents cause application freezes."
            },
            {
                "category": "Technical Specifications & Vendor Approval",
                "keywords": ["specification", "approved vendor", "solar pump", "capacity", "warranty", "equipment", "standards"],
                "importance": "Prevents procurement of non-compliant equipment ineligible for state reimbursement."
            },
            {
                "category": "Application Portal & Nodal Authority",
                "keywords": ["portal", "link", "department", "agriculture office", "apply", "krishi vigyan", "district officer"],
                "importance": "Ensures submission takes place through official state agriculture portals."
            },
            {
                "category": "Maintenance, Warranty & Support",
                "keywords": ["warranty", "maintenance", "service", "helpline", "repair", "amc", "support"],
                "importance": "Ensures post-installation equipment reliability and uptime during peak harvesting seasons."
            }
        ]

    # 2. Healthcare & Wellbeing
    elif any(k in text for k in ["health", "medical", "disease", "treatment", "clinic", "hospital", "patient", "drug", "symptom", "vaccine", "therapy", "wellbeing", "doctor", "prescription"]):
        return [
            {
                "category": "Clinical Scope & Indications",
                "keywords": ["indication", "condition", "disease", "symptom", "diagnosis", "patient", "scope"],
                "importance": "Delineates conditions where the therapy, procedure, or public health initiative is applicable."
            },
            {
                "category": "Contraindications & Safety Warnings",
                "keywords": ["contraindication", "warning", "risk", "side effect", "adverse", "precaution", "safety"],
                "importance": "Vital for identifying health risks and interactions that could endanger patient wellbeing."
            },
            {
                "category": "Evidence Quality & Clinical Trials",
                "keywords": ["clinical trial", "study", "evidence", "fda", "who", "peer-reviewed", "efficacy", "randomized"],
                "importance": "Distinguishes preliminary laboratory hypotheses from rigorously validated clinical outcomes."
            },
            {
                "category": "Accreditation & Regulatory Approvals",
                "keywords": ["approval", "approved", "certified", "licensed", "regulator", "fda", "board certified"],
                "importance": "Verifies that medications or healthcare facilities hold authentic accredited licensure."
            },
            {
                "category": "Costs, Insurance & Coverage",
                "keywords": ["cost", "insurance", "coverage", "copay", "reimbursement", "out-of-pocket", "medicare"],
                "importance": "Prevents catastrophic healthcare debt by verifying insurance pre-authorization rules."
            },
            {
                "category": "Qualified Professional Consultation",
                "keywords": ["physician", "doctor", "specialist", "medical professional", "hospital", "consultation"],
                "importance": "Mandatory reminder: AI analysis is not medical advice; consult certified practitioners."
            }
        ]

    # 3. Environment, Climate & Disasters
    elif any(k in text for k in ["environment", "climate", "pollution", "water", "flood", "emission", "waste", "carbon", "ecology", "air quality", "disaster", "drought", "conservation"]):
        return [
            {
                "category": "Baseline Environmental Measurements",
                "keywords": ["measurement", "ppm", "aqi", "concentration", "level", "threshold", "baseline", "monitoring"],
                "importance": "Establishes quantifiable pollution levels or climate risk indicators."
            },
            {
                "category": "Causal Factors & Source Attribution",
                "keywords": ["source", "cause", "industrial", "runoff", "discharge", "combustion", "culprit", "factor"],
                "importance": "Pins down specific contributors rather than attributing hazards to generalized factors."
            },
            {
                "category": "Mitigation & Action Plans",
                "keywords": ["mitigation", "action plan", "infrastructure", "drainage", "treatment", "containment", "strategy"],
                "importance": "Evaluates tangible engineering or policy measures in place to mitigate damage."
            },
            {
                "category": "Statutory Standards & Violations",
                "keywords": ["regulation", "limit", "compliance", "standard", "violation", "penalty", "epa", "permissible"],
                "importance": "Compares recorded values against legal contamination or emission standards."
            },
            {
                "category": "Emergency Alerts & Community Defense",
                "keywords": ["alert", "warning system", "evacuation", "shelter", "emergency", "hotline", "response team"],
                "importance": "Ensures local communities know evacuation protocols and alert thresholds."
            }
        ]

    # 4. Employment, Career & Recruitment
    elif any(k in text for k in ["job", "career", "hiring", "internship", "employment", "role", "salary", "interview", "recruitment"]):
        return [
            {
                "category": "Role Qualifications & Skills",
                "keywords": ["requirements", "experience", "skills", "degree", "qualification", "years of experience"],
                "importance": "Defines baseline qualifications required to pass candidate screening."
            },
            {
                "category": "Compensation & Benefits",
                "keywords": ["salary", "pay", "compensation", "benefits", "bonus", "equity", "health insurance"],
                "importance": "Ensures market rate parity and total reward transparency."
            },
            {
                "category": "Work Arrangement & Location",
                "keywords": ["remote", "hybrid", "on-site", "location", "relocation", "office", "travel"],
                "importance": "Prevents mismatched lifestyle and commuting expectations."
            },
            {
                "category": "Hiring Timeline & Stages",
                "keywords": ["stages", "interview", "assessment", "screening", "timeline", "rounds"],
                "importance": "Helps you prepare effectively for technical and behavioral interviews."
            },
            {
                "category": "Application Method & Contact",
                "keywords": ["apply", "recruiter", "careers page", "email", "submission", "hr"],
                "importance": "Validates official job posting and avoids third-party aggregator scams."
            }
        ]

    # 5. Government, Public Services & Welfare
    elif any(k in text for k in ["visa", "permit", "government", "immigration", "passport", "license", "policy", "legal", "tax", "scheme", "welfare", "citizen"]):
        return [
            {
                "category": "Eligibility & Legal Status",
                "keywords": ["status", "eligibility", "citizen", "resident", "qualify", "lawful"],
                "importance": "Non-compliance can lead to legal penalties, denial, or disqualification."
            },
            {
                "category": "Statutory Deadlines & Validity",
                "keywords": ["expiry", "validity", "duration", "deadline", "renewal", "grace period"],
                "importance": "Lapse of validity carries irreversible administrative consequences."
            },
            {
                "category": "Required Legal Documents",
                "keywords": ["apostille", "certified copy", "notary", "passport", "id", "affidavit", "police clearance", "aadhaar"],
                "importance": "Strict documentation standards are strictly enforced without exceptions."
            },
            {
                "category": "Official Fee Schedule",
                "keywords": ["fee", "cost", "tariff", "payment", "surcharge", "biometrics fee"],
                "importance": "Incorrect payments cause automatic rejection of statutory filings."
            },
            {
                "category": "Designated Authority & Official Portal",
                "keywords": ["authority", "ministry", "embassy", "consulate", "portal", "official department"],
                "importance": "Guarantees dealing directly with accredited governmental authorities."
            }
        ]

    # 6. Business, Finance & Markets
    elif any(k in text for k in ["business", "finance", "market", "startup", "investment", "supplier", "product", "revenue", "profit", "commerce", "stock"]):
        return [
            {
                "category": "Market Pricing & Cost Structure",
                "keywords": ["price", "cost", "margin", "pricing", "fee", "rate", "wholesale", "retail"],
                "importance": "Ensures accurate financial modeling and identifies hidden transaction overheads."
            },
            {
                "category": "Vendor & Supplier Reliability",
                "keywords": ["supplier", "vendor", "manufacturer", "lead time", "capacity", "reliability", "sla"],
                "importance": "Mitigates supply chain disruption by validating vendor performance track records."
            },
            {
                "category": "Regulatory & Licensing Compliance",
                "keywords": ["license", "permit", "compliance", "regulation", "tax", "gst", "incorporation"],
                "importance": "Prevents fines or operational shutdowns due to missing corporate registrations."
            },
            {
                "category": "Contractual Terms & Liabilities",
                "keywords": ["contract", "terms", "liability", "warranty", "cancellation", "clause", "indemnity"],
                "importance": "Uncovers binding fine print and restrictive covenants before signing."
            },
            {
                "category": "Dispute Resolution & Recourse",
                "keywords": ["dispute", "arbitration", "jurisdiction", "refund", "recourse", "customer service"],
                "importance": "Provides legal remedies in event of contract breaches or defective deliveries."
            }
        ]

    # 7. Technology, AI & Cybersecurity
    elif any(k in text for k in ["ai", "artificial intelligence", "technology", "software", "cybersecurity", "cloud", "data", "app", "network", "digital", "algorithm", "security"]):
        return [
            {
                "category": "Technical Architecture & Requirements",
                "keywords": ["architecture", "specifications", "api", "framework", "latency", "hardware", "dependencies"],
                "importance": "Validates system compatibility and infrastructure prerequisites."
            },
            {
                "category": "Security & Data Privacy Safeguards",
                "keywords": ["security", "encryption", "privacy", "gdpr", "vulnerability", "auth", "compliance", "threat"],
                "importance": "Protects sensitive user data and avoids cyber breach liabilities."
            },
            {
                "category": "Licensing, IP & Terms of Use",
                "keywords": ["license", "mit", "apache", "open source", "commercial", "proprietary", "copyright"],
                "importance": "Ensures code and model utilization is legally permitted for commercial deployments."
            },
            {
                "category": "Benchmark Performance & Accuracy",
                "keywords": ["benchmark", "accuracy", "f1", "latency", "throughput", "evaluation", "metrics"],
                "importance": "Replaces marketing hype with measurable, reproducible performance metrics."
            },
            {
                "category": "Support, Versioning & Deprecation",
                "keywords": ["version", "support", "deprecated", "roadmap", "maintenance", "documentation"],
                "importance": "Avoids vendor lock-in to unmaintained or abandoned technical components."
            }
        ]

    # 8. Transportation & Travel
    elif any(k in text for k in ["transport", "transit", "train", "flight", "traffic", "railway", "airline", "commute", "road safety", "vehicle", "bus", "metro"]):
        return [
            {
                "category": "Schedule, Routes & Frequency",
                "keywords": ["schedule", "route", "timetable", "frequency", "stop", "station", "departure"],
                "importance": "Critical for transit planning and preventing missed transfers."
            },
            {
                "category": "Fare Structure & Ticketing Rules",
                "keywords": ["fare", "ticket", "pass", "concession", "refund", "penalty", "card"],
                "importance": "Ensures purchasing legitimate travel passes and avoiding fine surcharges."
            },
            {
                "category": "Safety Protocols & Regulations",
                "keywords": ["safety", "inspection", "regulation", "speed limit", "emergency", "helmet", "seatbelt"],
                "importance": "Verifies passenger protection standards and compliant vehicle operation."
            },
            {
                "category": "Service Disruptions & Delay Policies",
                "keywords": ["delay", "disruption", "cancellation", "detour", "maintenance", "compensation"],
                "importance": "Clarifies passenger rights and refund eligibility during service interruptions."
            }
        ]

    # 9. Community & Social Issues
    elif any(k in text for k in ["community", "social", "housing", "poverty", "civic", "ngo", "sanitation", "youth", "neighborhood", "public facility"]):
        return [
            {
                "category": "Identified Community Needs & Scope",
                "keywords": ["need", "problem", "scope", "residents", "affected", "demand", "survey"],
                "importance": "Establishes grassroots priorities directly from affected community members."
            },
            {
                "category": "Allocated Budget & Funding Sources",
                "keywords": ["budget", "funding", "grant", "allocation", "donation", "csr", "municipal"],
                "importance": "Ensures accountability and confirms financial backing for local initiatives."
            },
            {
                "category": "Execution Timeline & Milestones",
                "keywords": ["timeline", "milestone", "completion", "phase", "deadline", "target date"],
                "importance": "Tracks project delivery and holds implementing bodies accountable."
            },
            {
                "category": "Public Oversight & Feedback Mechanisms",
                "keywords": ["oversight", "grievance", "feedback", "meeting", "counselor", "transparency"],
                "importance": "Empowers citizens to register grievances and audit project execution."
            }
        ]

    # 10. Research, Science & Academia
    elif any(k in text for k in ["science", "scientific", "study", "paper", "experiment", "hypothesis", "biology", "physics", "chemistry", "empirical", "methodology"]):
        return [
            {
                "category": "Research Methodology & Sample Size",
                "keywords": ["methodology", "sample size", "control", "cohort", "design", "protocol", "statistical"],
                "importance": "Determines statistical rigor and validity of scientific conclusions."
            },
            {
                "category": "Experimental Reproducibility & Controls",
                "keywords": ["reproduce", "reproducibility", "baseline", "control group", "replicate", "dataset"],
                "importance": "Guarantees findings are not anomalies or unrepeatable lab artifacts."
            },
            {
                "category": "Limitations & Confounding Variables",
                "keywords": ["limitation", "confound", "bias", "error", "caveat", "assumption"],
                "importance": "Exposes boundary conditions and external factors impacting outcomes."
            },
            {
                "category": "Peer Review & Replication Status",
                "keywords": ["peer review", "journal", "published", "preprint", "citation", "corroboration"],
                "importance": "Differentiates preliminary unvetted preprints from verified scientific consensus."
            }
        ]

    # 11. Education, Admissions, Scholarships & Courses
    elif any(k in text for k in ["scholarship", "fellowship", "education", "college", "university", "admission", "exam", "course", "degree", "curriculum", "tuition"]):
        return [
            {
                "category": "Eligibility Criteria",
                "keywords": ["eligible", "eligibility", "gpa", "major", "nationality", "age", "criteria", "who can apply"],
                "importance": "Crucial to verify whether you qualify before investing time in the application."
            },
            {
                "category": "Application Deadline",
                "keywords": ["deadline", "due date", "closing date", "cutoff", "submit by", "timeline"],
                "importance": "Missing deadlines results in immediate disqualification."
            },
            {
                "category": "Required Documents",
                "keywords": ["document", "transcript", "recommendation", "letter", "lor", "statement", "essay", "cv", "resume", "notarized"],
                "importance": "Incomplete or improperly formatted documentation is a frequent cause of rejection."
            },
            {
                "category": "Fee Schedule & Financial Terms",
                "keywords": ["amount", "disbursement", "tuition", "stipend", "coverage", "benefits", "payment", "fee", "$"],
                "importance": "Vital for calculating financial viability and co-funding responsibilities."
            },
            {
                "category": "Renewal / Continuing Conditions",
                "keywords": ["renewal", "maintain", "subsequent year", "academic standing", "retain", "satisfactory progress", "gpa requirement"],
                "importance": "Determines whether support is sustainable across future terms."
            },
            {
                "category": "Official Portal & Point of Contact",
                "keywords": ["portal", "link", "submit", "apply", "contact", "email", "adviser"],
                "importance": "Ensures submission occurs via legitimate official channels."
            }
        ]

    # 12. Default Universal Real-World Research Categories (for custom/other topics)
    return [
        {
            "category": "Core Objectives & Scope",
            "keywords": ["objective", "goal", "scope", "purpose", "target", "focus", "problem"],
            "importance": "Clarifies what the subject actually addresses and what lies outside boundaries."
        },
        {
            "category": "Key Requirements & Conditions",
            "keywords": ["requirement", "condition", "prerequisite", "criteria", "rule", "standard", "qualification"],
            "importance": "Outlines mandatory criteria needed for successful execution or compliance."
        },
        {
            "category": "Timeline & Critical Dates",
            "keywords": ["date", "deadline", "timeline", "schedule", "period", "phase", "milestone", "validity"],
            "importance": "Critical for time management and sequence coordination."
        },
        {
            "category": "Operational Methodology & Procedures",
            "keywords": ["method", "process", "procedure", "how to", "step", "protocol", "implementation"],
            "importance": "Ensures reproducible, compliant, and actionable execution."
        },
        {
            "category": "Discrepancies & Limitations",
            "keywords": ["limitation", "caveat", "restriction", "conflict", "disclaimer", "risk", "gap"],
            "importance": "Prevents reliance on unverified, incomplete, or restricted information."
        },
        {
            "category": "Official Authority & Point of Contact",
            "keywords": ["contact", "source", "author", "department", "organization", "support", "authority"],
            "importance": "Provides direct verification channels with primary stakeholders."
        }
    ]

def detect_information_gaps(
    question: str,
    topic: str,
    goal: str,
    sources: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Core gap detection algorithm executing the 15-step pipeline:
    - Analyzes content from all sources
    - Evaluates presence vs absence of expected domain categories
    - Flags conflicting statements
    - Identifies outdated information
    - Synthesizes findings, unanswered questions, and prioritized checklist
    """
    categories = determine_domain_categories(question, topic, goal)
    
    # Aggregate text and chunks
    combined_sources_text = ""
    source_citation_map = {}
    for src in sources:
        combined_sources_text += f"\n [{src.get('citation_id', 'SRC')}] {src.get('title', '')} : {src.get('raw_content', '')}"
        source_citation_map[src.get("citation_id", "SRC")] = src
        
    gaps_list = []
    findings_list = []
    conflicts_list = []
    outdated_list = []
    unanswered_list = []
    checklist_list = []
    
    # 1. Evaluate Categories for Gaps
    for cat in categories:
        category_name = cat["category"]
        keywords = cat["keywords"]
        importance = cat["importance"]
        
        matches = [k for k in keywords if re.search(r'\b' + re.escape(k) + r'\b', combined_sources_text, re.IGNORECASE)]
        
        if len(matches) >= 3:
            status = "Found"
            explanation = f"Adequate details regarding {category_name.lower()} are documented across the reviewed sources (found mentions of {', '.join(matches[:3])})."
            priority = "Low"
            suggested_next_step = f"Review documented details for specific procedural nuances."
        elif 1 <= len(matches) < 3:
            status = "Partially found"
            explanation = f"Partial references to {category_name.lower()} were found (mentions of {', '.join(matches)}), but complete operational specifications or official instructions are absent."
            priority = "Medium"
            suggested_next_step = f"Request primary documentation explicitly confirming full {category_name.lower()} terms."
        else:
            status = "Not found in sources reviewed"
            explanation = f"No substantive mention of {category_name.lower()} was identified within the provided source materials."
            priority = "High"
            suggested_next_step = f"Consult official administrator or issuer directly to clarify {category_name.lower()} before proceeding."
            
        sources_reviewed_str = ", ".join(src.get("citation_id", "SRC") for src in sources) if sources else "None"
        
        # Only add to gaps if not fully found or requires attention
        if status != "Found":
            gaps_list.append({
                "category": category_name,
                "title": f"Missing Specifics: {category_name}",
                "explanation": explanation,
                "why_it_matters": importance,
                "sources_reviewed": sources_reviewed_str,
                "priority": priority,
                "suggested_next_step": suggested_next_step,
                "status": status
            })
            
            checklist_list.append({
                "title": f"Verify {category_name}",
                "why_it_matters": importance,
                "suggested_source": "Official issuing body / Primary website",
                "priority": priority,
                "is_completed": False,
                "order_index": len(checklist_list)
            })

    # 2. Extract Key Findings from text
    for src in sources:
        raw = src.get("raw_content", "")
        cit = src.get("citation_id", "SRC")
        title = src.get("title", "Source")
        
        # Look for concrete facts, dates, requirements, numbers
        sentences = [s.strip() for s in re.split(r'[.\n]', raw) if len(s.strip()) > 35]
        for s in sentences[:2]:
            if any(term in s.lower() for term in ["must", "require", "eligible", "deadline", "award", "program", "amount", "offered"]):
                findings_list.append({
                    "title": f"Requirement / Finding from {title[:30]}...",
                    "explanation": s,
                    "supporting_evidence": f"Explicitly noted in {title} [{cit}].",
                    "citation_ids": cit,
                    "evidence_strength": "Strong" if len(raw) > 500 else "Moderate"
                })
                break
                
    if not findings_list:
        findings_list.append({
            "title": "Preliminary Source Intake",
            "explanation": f"Source records reviewed provided preliminary contextual data regarding '{question}'.",
            "supporting_evidence": "Extracted from provided source materials.",
            "citation_ids": sources[0].get("citation_id", "SRC-001") if sources else "SRC-001",
            "evidence_strength": "Moderate"
        })

    # 3. Conflict Detection across sources
    if len(sources) >= 2:
        dates_found = []
        for src in sources:
            found_dates = re.findall(r'(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}|\b202[0-9]\b', src.get("raw_content", ""))
            if found_dates:
                dates_found.append((src.get("citation_id"), src.get("title"), found_dates))
                
        if len(dates_found) >= 2 and dates_found[0][2] != dates_found[1][2]:
            conflicts_list.append({
                "claim_a": f"References dates/timeline: {', '.join(dates_found[0][2][:2])}",
                "source_a_citation": dates_found[0][0],
                "claim_b": f"References dates/timeline: {', '.join(dates_found[1][2][:2])}",
                "source_b_citation": dates_found[1][0],
                "explanation": f"Different calendar deadlines or cycle years were cited across {dates_found[0][0]} and {dates_found[1][0]}.",
                "possible_reason": "One source may pertain to a prior cycle/academic year, or different applicant classifications.",
                "what_to_verify": "Confirm the current active cycle deadline directly on the primary portal before submitting."
            })
            
            checklist_list.insert(0, {
                "title": f"Resolve Date Conflict between {dates_found[0][0]} and {dates_found[1][0]}",
                "why_it_matters": "Conflicting deadlines risk late submission or premature filing with stale rules.",
                "suggested_source": f"{dates_found[0][1]} vs {dates_found[1][1]}",
                "priority": "High",
                "is_completed": False,
                "order_index": 0
            })

    # 4. Outdated Information Detection
    for src in sources:
        pub_date = src.get("publication_date") or ""
        raw = src.get("raw_content", "")
        cit = src.get("citation_id", "SRC")
        
        # Check for past years (e.g. 2020-2024 when in current context)
        past_years = re.findall(r'\b(2020|2021|2022|2023|2024)\b', pub_date + " " + raw)
        if past_years:
            unique_past = sorted(list(set(past_years)))
            outdated_list.append({
                "source_citation": cit,
                "publication_date": pub_date if pub_date else "Unstated in header",
                "collection_date": src.get("collected_at"),
                "flag_text": f"Source repeatedly references past cycle year(s): {', '.join(unique_past)}.",
                "reason": "Information may describe expired eligibility brackets, legacy requirements, or outdated fee structures."
            })

    # 5. Unanswered Questions
    unanswered_list = [
        {
            "question": f"What is the official procedure if documentation cannot be obtained prior to the cutoff date?",
            "importance": "Prevents disqualification in event of bureaucratic transcript delays.",
            "recommended_source": "Admissions / Award Officer Direct Inquiries"
        },
        {
            "question": f"Are there unstated post-award obligations, tax liabilities, or service commitments?",
            "importance": "Uncovering conditional fine print before signing binding acceptance terms.",
            "recommended_source": "Financial Aid Legal Terms / Award Handbook"
        }
    ]

    # Executive Summary Synthesis
    total_gaps = len(gaps_list)
    total_conflicts = len(conflicts_list)
    summary = (
        f"Multi-source analysis for '{question}' synthesized {len(sources)} source(s). "
        f"The engine identified {len(findings_list)} verified finding(s), {total_gaps} information gap(s) "
        f"categorized as not found or partially found in the reviewed materials, and {total_conflicts} potential conflicting claim(s). "
        f"Users must address prioritized verification items to confirm operational terms with primary authorities."
    )
    
    is_health_topic = any(k in f"{question} {topic} {goal}".lower() for k in ["health", "medical", "disease", "treatment", "clinic", "hospital", "patient", "drug", "symptom", "vaccine", "doctor"])
    medical_notice = " Medical Notice: AI-generated information is for informational verification only and is not a substitute for qualified medical professionals." if is_health_topic else ""

    limitations = (
        "This evaluation is grounded strictly upon the source text provided. Absence of information "
        "indicates that details were 'Not found in sources reviewed', not that they do not exist in reality. "
        "Evidence strength metrics reflect textual corroboration and do not constitute legal or official guarantee."
        + medical_notice
    )

    return {
        "summary": summary,
        "findings": findings_list,
        "gaps": gaps_list,
        "conflicts": conflicts_list,
        "outdated_warnings": outdated_list,
        "unanswered_questions": unanswered_list,
        "checklist": checklist_list,
        "limitations": limitations
    }
