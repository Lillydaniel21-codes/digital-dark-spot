import re
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import User, SearchHistory
from app.schemas.schemas import (
    SearchSuggestionResponse,
    SearchSuggestionItem,
    SearchHistoryItem,
    SearchHistoryCreate
)
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/search", tags=["Smart Search & Suggestions"])

# Comprehensive real-world topics knowledge bank across all domains
KNOWLEDGE_BANK = [
    # Agriculture & Farming
    {"query": "Farmer government schemes eligibility and application process", "domain": "Agriculture & Farming", "category": "Schemes", "keywords": ["farm", "farmer", "scheme", "kisan", "subsidy", "agriculture"]},
    {"query": "Solar pump irrigation subsidy under PM-KUSUM scheme", "domain": "Agriculture & Farming", "category": "Irrigation", "keywords": ["solar", "pump", "irrigation", "water", "farm", "kusum", "subsidy"]},
    {"query": "Crop insurance claim settlement timeline and rejected cases", "domain": "Agriculture & Farming", "category": "Crop Insurance", "keywords": ["crop", "insurance", "claim", "damage", "farmer", "drought"]},
    {"query": "Organic farming certification requirements and compliance rules", "domain": "Agriculture & Farming", "category": "Farming Practices", "keywords": ["organic", "certification", "farming", "soil", "fertilizer"]},
    {"query": "Agricultural market price MSP transparency and mandi rules", "domain": "Agriculture & Farming", "category": "Market Prices", "keywords": ["mandi", "msp", "price", "market", "yield", "grain"]},

    # Healthcare & Wellbeing
    {"query": "Telemedicine prescription validity and controlled medicine rules", "domain": "Healthcare & Wellbeing", "category": "Public Health", "keywords": ["health", "telemedicine", "prescription", "doctor", "medicine"]},
    {"query": "Generic vs branded medicine bioequivalence and cost disparity", "domain": "Healthcare & Wellbeing", "category": "Medical Research", "keywords": ["generic", "branded", "drug", "medicine", "pharmacy", "cost"]},
    {"query": "Government health insurance cashless hospital network coverage", "domain": "Healthcare & Wellbeing", "category": "Healthcare Services", "keywords": ["health", "insurance", "ayushman", "hospital", "coverage"]},
    {"query": "Clinical trial informed consent requirements and patient rights", "domain": "Healthcare & Wellbeing", "category": "Clinical Research", "keywords": ["clinical", "trial", "patient", "consent", "fda", "medical"]},
    {"query": "Vaccination schedule guidelines and booster dose recommendations", "domain": "Healthcare & Wellbeing", "category": "Preventive Care", "keywords": ["vaccine", "immunization", "booster", "schedule", "safety"]},

    # Environment & Climate
    {"query": "Causes of industrial water pollution and effluent compliance standards", "domain": "Environment & Climate", "category": "Pollution", "keywords": ["water", "pollution", "river", "effluent", "industrial", "environment"]},
    {"query": "Urban flood risk management and drainage infrastructure bottlenecks", "domain": "Environment & Climate", "category": "Disasters", "keywords": ["flood", "drainage", "urban", "monsoon", "disaster", "storm"]},
    {"query": "Air Quality Index (AQI) particulate limits and vehicle emissions rules", "domain": "Environment & Climate", "category": "Air Quality", "keywords": ["air", "aqi", "pollution", "emission", "smog", "particulate"]},
    {"query": "Groundwater depletion rates and rainwater harvesting compliance", "domain": "Environment & Climate", "category": "Water Resources", "keywords": ["groundwater", "water", "aquifer", "harvesting", "borewell"]},
    {"query": "Renewable solar energy grid tariffs and net metering policies", "domain": "Environment & Climate", "category": "Clean Energy", "keywords": ["solar", "renewable", "energy", "grid", "carbon", "tariff"]},

    # Employment & Career
    {"query": "Government recruitment exam notification, age limits, and reservations", "domain": "Employment & Career", "category": "Government Jobs", "keywords": ["job", "recruitment", "exam", "upsc", "ssc", "age limit", "vacancy"]},
    {"query": "Remote work tax compliance and cross-border employment liabilities", "domain": "Employment & Career", "category": "Work Arrangements", "keywords": ["remote", "work", "job", "tax", "hybrid", "employment"]},
    {"query": "Software engineer tech stack interview stages and skill benchmarks", "domain": "Employment & Career", "category": "Tech Hiring", "keywords": ["interview", "skills", "salary", "software", "hiring", "engineer"]},
    {"query": "Apprenticeship stipend regulations and minimum wage guidelines", "domain": "Employment & Career", "category": "Labor Standards", "keywords": ["internship", "stipend", "minimum wage", "labor", "rights"]},

    # Education & Higher Studies
    {"query": "College admission eligibility criteria, cutoffs, and counseling rounds", "domain": "Education & Higher Studies", "category": "Admissions", "keywords": ["college", "admission", "cutoff", "counseling", "university"]},
    {"query": "International STEM scholarship eligibility, GPA cutoffs, and renewal terms", "domain": "Education & Higher Studies", "category": "Scholarships", "keywords": ["scholarship", "gpa", "fellowship", "study", "tuition", "grant"]},
    {"query": "National entrance exam syllabus changes and marking schemes", "domain": "Education & Higher Studies", "category": "Exams", "keywords": ["exam", "entrance", "neet", "jee", "syllabus", "pattern"]},
    {"query": "Accredited online degree recognition and employer acceptance", "domain": "Education & Higher Studies", "category": "Online Learning", "keywords": ["degree", "online", "accreditation", "ugc", "distance"]},

    # Government Services & Public Policy
    {"query": "Citizen passport renewal processing times and required police verification", "domain": "Government & Public Services", "category": "Citizen Services", "keywords": ["passport", "renewal", "police", "verification", "visa"]},
    {"query": "Public distribution ration card eligibility and family income thresholds", "domain": "Government & Public Services", "category": "Welfare", "keywords": ["ration", "pds", "food", "welfare", "bpl", "subsidy"]},
    {"query": "Birth certificate name correction procedure and mandatory affidavits", "domain": "Government & Public Services", "category": "Civil Documents", "keywords": ["certificate", "correction", "affidavit", "notary", "municipal"]},
    {"query": "Right to Information (RTI) application filing procedure and appeal stages", "domain": "Government & Public Services", "category": "Transparency", "keywords": ["rti", "information", "appeal", "officer", "government"]},

    # Business, Finance & Entrepreneurship
    {"query": "MSME small business loan interest subsidy under collateral-free schemes", "domain": "Business & Finance", "category": "Business Financing", "keywords": ["business", "msme", "loan", "startup", "collateral", "interest"]},
    {"query": "GST registration threshold limits and quarterly filing rules", "domain": "Business & Finance", "category": "Taxation", "keywords": ["gst", "tax", "invoice", "compliance", "small business"]},
    {"query": "Vendor procurement contract clauses and penalty terms for delivery delay", "domain": "Business & Finance", "category": "Contracts", "keywords": ["vendor", "contract", "penalty", "procurement", "agreement"]},
    {"query": "Mutual fund expense ratio comparison and direct vs regular plans", "domain": "Business & Finance", "category": "Financial Literacy", "keywords": ["invest", "mutual fund", "sip", "expense ratio", "finance"]},

    # Technology & Cybersecurity
    {"query": "Open source software license commercial use restrictions and GPL compliance", "domain": "Technology & Cybersecurity", "category": "Software Licensing", "keywords": ["license", "open source", "gpl", "mit", "software", "commercial"]},
    {"query": "Cybercrime phishing reporting procedure and lost funds freeze request", "domain": "Technology & Cybersecurity", "category": "Cyber Awareness", "keywords": ["cyber", "fraud", "phishing", "scam", "bank", "police"]},
    {"query": "AI model fine-tuning data privacy rules and copyright infringement liability", "domain": "Technology & Cybersecurity", "category": "Artificial Intelligence", "keywords": ["ai", "model", "data", "privacy", "copyright", "training"]},
    {"query": "Cloud hosting SLA downtime compensation policies and egress fees", "domain": "Technology & Cybersecurity", "category": "Cloud Infrastructure", "keywords": ["cloud", "hosting", "aws", "sla", "downtime", "server"]},

    # Transportation & Travel
    {"query": "High-speed rail ticket cancellation refund rules and waiting list priority", "domain": "Transportation & Travel", "category": "Railways", "keywords": ["train", "railway", "ticket", "cancellation", "refund", "transit"]},
    {"query": "Public bus transit route map frequency and monthly student concession pass", "domain": "Transportation & Travel", "category": "Public Transit", "keywords": ["bus", "transit", "pass", "route", "commute", "fare"]},
    {"query": "International driving permit requirements and bilateral treaty validity", "domain": "Transportation & Travel", "category": "Travel", "keywords": ["driving", "license", "permit", "international", "travel"]},

    # Community & Social Welfare
    {"query": "Elderly citizen pension scheme eligibility and annual life certificate submission", "domain": "Community & Social Problems", "category": "Social Welfare", "keywords": ["pension", "elderly", "senior", "life certificate", "social"]},
    {"query": "Community waste segregation guidelines and municipal fine schedules", "domain": "Community & Social Problems", "category": "Civic Services", "keywords": ["waste", "garbage", "sanitation", "segregation", "community"]},
    {"query": "Local NGO registration under Section 8 vs Trust deed legal requirements", "domain": "Community & Social Problems", "category": "NGO & Civic", "keywords": ["ngo", "trust", "society", "charity", "registration"]}
]

POPULAR_QUERIES = [
    "Farmer solar irrigation pump subsidy under PM-KUSUM",
    "Government scheme eligibility for small businesses",
    "Causes of water pollution and industrial compliance limits",
    "Telemedicine prescription validity and medical guidelines",
    "Recruitment exam eligibility and age limit requirements",
    "College admission cutoffs and counseling rounds",
    "Open source software commercial license requirements",
    "Citizen passport renewal timeline and verification checklist"
]

@router.get("/suggestions", response_model=SearchSuggestionResponse)
def get_search_suggestions(
    q: str = Query("", description="Search query string"),
    domain: Optional[str] = Query(None, description="Optional domain filter"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    clean_q = q.strip().lower()
    
    if not clean_q:
        # Return popular and recent searches
        recent = db.query(SearchHistory).filter(SearchHistory.user_id == current_user.id).order_by(SearchHistory.created_at.desc()).limit(5).all()
        history_items = [SearchSuggestionItem(query=h.query, domain=h.domain, type="history") for h in recent]
        popular_items = [SearchSuggestionItem(query=p, domain="Multi-Domain", type="popular") for p in POPULAR_QUERIES[:6]]
        
        return SearchSuggestionResponse(
            query="",
            suggestions=history_items + popular_items,
            related_questions=POPULAR_QUERIES[:4],
            popular=POPULAR_QUERIES[:6],
            domain_hint=None
        )

    # Dynamic Matching Engine
    tokens = clean_q.split()
    matched_items = []
    
    for item in KNOWLEDGE_BANK:
        item_text = (item["query"] + " " + item["domain"] + " " + " ".join(item["keywords"])).lower()
        score = 0
        
        # Check phrase match
        if clean_q in item_text:
            score += 10
            
        # Check token matches
        for t in tokens:
            if t in item_text:
                score += 2
                
        if score > 0:
            matched_items.append((score, item))
            
    # Sort by relevance score
    matched_items.sort(key=lambda x: x[0], reverse=True)
    
    suggestions = []
    seen = set()
    for _, item in matched_items[:8]:
        if item["query"] not in seen:
            seen.add(item["query"])
            suggestions.append(SearchSuggestionItem(
                id=f"sug-{abs(hash(item['query']))}",
                query=item["query"],
                title=item["query"],
                question=item["query"],
                description=f"Examine key information gaps and unstated requirements for {item.get('category', item['domain'])}.",
                domain=item["domain"],
                category=item.get("category"),
                type="suggestion"
            ))

    # If user types a free-form custom query not yet in knowledge bank, generate dynamic tailored completions!
    if len(suggestions) < 3:
        # Generate custom variations matching the user's specific words
        custom_templates = [
            f"What information is missing about {clean_q}?",
            f"Eligibility requirements and official guidelines for {clean_q}",
            f"Conflicting claims and evidence regarding {clean_q}",
            f"Verification checklist and common problems in {clean_q}"
        ]
        for ct in custom_templates:
            if ct not in seen:
                seen.add(ct)
                suggestions.append(SearchSuggestionItem(
                    id=f"custom-{abs(hash(ct))}",
                    query=ct,
                    title=ct,
                    question=ct,
                    description=f"Identify missing criteria, outdated terms, and verification checks for {clean_q}.",
                    domain=domain or "General & Custom Topics",
                    category="Custom Research",
                    type="suggestion"
                ))

    # Infer domain hint
    detected_domain = None
    if suggestions:
        detected_domain = suggestions[0].domain

    # Related inquiry questions
    related = [
        f"What should I verify before proceeding with {clean_q}?",
        f"What are the critical unverified assumptions in {clean_q}?",
        f"Official sources and contact points for {clean_q}"
    ]

    return SearchSuggestionResponse(
        query=q,
        suggestions=suggestions[:8],
        related_questions=related,
        popular=POPULAR_QUERIES[:5],
        domain_hint=detected_domain
    )

@router.get("/popular", response_model=List[SearchSuggestionItem])
def get_popular_searches():
    items = []
    for idx, p in enumerate(POPULAR_QUERIES):
        kb_match = next((k for k in KNOWLEDGE_BANK if k["query"].lower() in p.lower() or p.lower() in k["query"].lower()), None)
        dom = kb_match["domain"] if kb_match else "Multi-Domain"
        cat = kb_match["category"] if kb_match else "Popular Topic"
        items.append(SearchSuggestionItem(
            id=f"pop-{idx}",
            query=p,
            title=p,
            question=p,
            description=f"Information gap audit for {cat}.",
            domain=dom,
            category=cat,
            type="popular"
        ))
    return items

@router.get("/history", response_model=List[SearchHistoryItem])
def get_search_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(SearchHistory).filter(SearchHistory.user_id == current_user.id).order_by(SearchHistory.created_at.desc()).limit(15).all()

@router.post("/history", response_model=SearchHistoryItem)
def add_search_history(
    data: SearchHistoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query_clean = data.query.strip()
    if not query_clean:
        return
        
    # Remove existing duplicate to keep latest on top
    db.query(SearchHistory).filter(SearchHistory.user_id == current_user.id, SearchHistory.query == query_clean).delete()
    
    item = SearchHistory(
        user_id=current_user.id,
        query=query_clean,
        domain=data.domain or "General"
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/history")
def clear_search_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(SearchHistory).filter(SearchHistory.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Search history cleared successfully."}
