import datetime
from sqlalchemy.orm import Session
from app.models.models import (
    ResearchProject, Source, SourceChunk, Analysis,
    Finding, InformationGap, Conflict, OutdatedWarning,
    UnansweredQuestion, ChecklistItem, ChatConversation, ChatMessage
)

def seed_sample_research_project(db: Session, user_id: str, domain: str = "agriculture") -> ResearchProject:
    """
    Creates or resets pre-configured high-fidelity real-world research benchmarks
    across multiple domains (Agriculture, Healthcare, Environment, Employment, Education).
    """
    now = datetime.datetime.utcnow()
    domain_key = domain.lower()

    if "health" in domain_key:
        return _seed_healthcare_project(db, user_id, now)
    elif "env" in domain_key or "flood" in domain_key or "water" in domain_key:
        return _seed_environment_project(db, user_id, now)
    elif "job" in domain_key or "career" in domain_key or "employ" in domain_key:
        return _seed_employment_project(db, user_id, now)
    elif "edu" in domain_key or "scholar" in domain_key:
        return _seed_education_project(db, user_id, now)
    else:
        # Default flag benchmark: Agriculture & Farming
        return _seed_agriculture_project(db, user_id, now)

def _seed_agriculture_project(db: Session, user_id: str, now: datetime.datetime) -> ResearchProject:
    title = "Solar Irrigation Pump Subsidy (PM-KUSUM) & Farmer Eligibility"
    existing = db.query(ResearchProject).filter(
        ResearchProject.user_id == user_id,
        ResearchProject.title == title
    ).first()
    if existing:
        db.delete(existing)
        db.commit()

    project = ResearchProject(
        user_id=user_id,
        title=title,
        research_question="What conditions, hidden costs, and mandatory clauses should farmers verify before applying for the solar pump subsidy?",
        topic="Agriculture & Farming",
        location="National & State Agro-Districts",
        goal="Identify omitted disclaimers regarding grid connection surrender, conflicting subsidy caps, and unverified vendor maintenance obligations.",
        keywords="agriculture, farmer, solar pump, subsidy, irrigation, kusum, borewell",
        status="analyzed",
        created_at=now,
        updated_at=now
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    src1 = Source(
        research_id=project.id,
        title="Ministry of Renewable Energy PM-KUSUM Component-B Guidelines (2025/2026)",
        original_url="https://mnre.gov.in/schemes/kusum-component-b-2025",
        source_type="sample",
        citation_id="SRC-001",
        publication_date="2025-07-20",
        collected_at=now,
        status="ready",
        extracted_summary="Official guidelines detailing 30% central financial assistance, 5HP to 7.5HP standalone DC surface/submersible solar pump capacities, and national portal application.",
        raw_content="""Ministry of New and Renewable Energy - PM-KUSUM Component-B Operational Guidelines (2025/2026)
Scope: Installation of standalone solar agriculture pumps for individual farmers in off-grid areas.
Central Financial Assistance (CFA): Central benchmark subsidy is strictly capped at 30% of the benchmark cost. State governments may provide an additional 30% subsidy, with the remaining 40% borne by the farmer directly or via bank loan.
Eligibility: Individual farmers, Water User Associations, and Primary Agriculture Credit Societies. Farmers must own land with a verified borewell or open water source.
Critical Clause: Beneficiaries currently holding an active grid-connected agricultural electricity connection are strictly ineligible for standalone Component-B unless they formally surrender their existing electric connection."""
    )

    src2 = Source(
        research_id=project.id,
        title="State Agriculture Department Solar Pump Promotional Notice (2024)",
        original_url="https://agri.state.gov.in/solar-irrigation-scheme-notice-2024",
        source_type="sample",
        citation_id="SRC-002",
        publication_date="2024-02-14",
        collected_at=now,
        status="ready",
        extracted_summary="State level brochure advertising 'Up to 75% Total Subsidy' and promising free installation within 30 days without mentioning the mandatory grid connection surrender rule.",
        raw_content="""State Department of Agriculture - Solar Water Pump Subsidy Drive 2024
Notice for Farmers: Get high-efficiency solar water pumps with up to 75% total state and central subsidy!
Installation Guarantee: Certified state empanelled vendors will complete pump installation and ground testing within 30 days of registration.
Application: Any farmer with verified land ownership can register at the local block development office or online portal with Aadhaar and bank passbook."""
    )

    src3 = Source(
        research_id=project.id,
        title="Krishi Vigyan Kendra & Farmer Cooperative Ground Audit Report",
        original_url="https://krishivigyan.org/reports/solar-pump-adoption-hurdles",
        source_type="sample",
        citation_id="SRC-003",
        publication_date="2025-02-10",
        collected_at=now,
        status="ready",
        extracted_summary="Field audit revealing unstated transformer removal fees, water table depth restrictions, and severe vendor delays in 5-year AMC maintenance.",
        raw_content="""Krishi Cooperative Field Audit - What Farmers Need to Know Before Installing Solar Pumps
Field Observations:
1. Surrender Trap: Several farmers who applied had their existing subsidized electrical meters disconnected permanently before the solar pump was energized, leaving them without irrigation during crucial sowing weeks.
2. Water Table Limits: The scheme requires pumps to be rated for borewells up to 300 feet. In areas where water tables dipped below 350 feet, the subsidized 5HP pumps failed to lift water, and deeper pump upgrades were disqualified from subsidy reimbursement.
3. 5-Year Maintenance Reality: While guidelines state vendors must provide free 5-year comprehensive maintenance (AMC), over 40% of surveyed farmers waited more than 3 weeks for inverter repairs."""
    )
    db.add_all([src1, src2, src3])
    db.commit()

    # Chunks
    c1 = SourceChunk(source_id=src1.id, chunk_index=0, text=src1.raw_content, token_count=180, metadata_json='{"citation": "SRC-001"}')
    c2 = SourceChunk(source_id=src2.id, chunk_index=0, text=src2.raw_content, token_count=130, metadata_json='{"citation": "SRC-002"}')
    c3 = SourceChunk(source_id=src3.id, chunk_index=0, text=src3.raw_content, token_count=190, metadata_json='{"citation": "SRC-003"}')
    db.add_all([c1, c2, c3])
    db.commit()

    analysis = Analysis(
        research_id=project.id,
        executive_summary=(
            "Cross-source analysis of 3 primary government guidelines and field audit reports for the Solar Pump Subsidy (PM-KUSUM) "
            "reveals critical information gaps and conflicting claims. While central guidelines state a 30% CFA cap and mandatory grid connection surrender, "
            "state promotional literature advertises up to 75% subsidy while omitting the surrender requirement entirely. "
            "Farmers risk irreversible disconnection of subsidized electricity meters and borewell depth disqualifications."
        ),
        limitations="Grounding is restricted to reviewed agricultural guidelines [SRC-001, SRC-002, SRC-003]. Missing clauses are labeled as 'Not found in sources reviewed'.",
        is_demo=True,
        created_at=now
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    f1 = Finding(
        analysis_id=analysis.id,
        title="Mandatory Grid Electric Connection Surrender Clause",
        explanation="Central guidelines mandate that farmers with existing grid connections are ineligible for Component-B unless they permanently surrender their electric connection.",
        supporting_evidence="Explicitly stated in MNRE PM-KUSUM Operational Guidelines [SRC-001].",
        citation_ids="SRC-001",
        evidence_strength="Strong"
    )
    f2 = Finding(
        analysis_id=analysis.id,
        title="Co-Funding Burden Split Across Three Tiers",
        explanation="Central funding covers 30%, state subsidy covers 30%, while 40% must be paid directly by the farmer or financed through a priority sector agriculture loan.",
        supporting_evidence="Confirmed in SRC-001 and corroborated by cooperative field data [SRC-003].",
        citation_ids="SRC-001, SRC-003",
        evidence_strength="Strong"
    )
    db.add_all([f1, f2])

    g1 = InformationGap(
        analysis_id=analysis.id,
        category="Grid Surrender Disclaimers",
        title="Unstated Electrical Disconnection Timeline & Penalties",
        explanation="State promotional flyers [SRC-002] omit any mention of having to surrender grid power lines, leading farmers to apply without realizing their existing power meters will be cut.",
        why_it_matters="If solar pump delivery is delayed, farmers are left with zero irrigation power during peak planting cycles.",
        sources_reviewed="SRC-001, SRC-002, SRC-003",
        priority="High",
        suggested_next_step="Request written confirmation from the District Agriculture Officer regarding whether temporary dual-connection grace periods exist.",
        status="Not found in sources reviewed"
    )
    g2 = InformationGap(
        analysis_id=analysis.id,
        category="Borewell Depth Limits",
        title="Missing Water Table Depth vs Motor Capacity Guidelines",
        explanation="Sources do not state the maximum allowable water table depth before a 5HP pump becomes ineffective, nor how farmers can upgrade to 7.5HP or 10HP systems without subsidy forfeiture.",
        why_it_matters="Pumps installed in deep aquifer regions fail to extract sufficient water.",
        sources_reviewed="SRC-001, SRC-002",
        priority="Medium",
        suggested_next_step="Obtain a certified hydro-geological water table depth test before finalizing pump capacity selection.",
        status="Partially found"
    )
    db.add_all([g1, g2])

    c1 = Conflict(
        analysis_id=analysis.id,
        claim_a="Subsidy is 30% Central + 30% State, with 40% farmer contribution [SRC-001]",
        source_a_citation="SRC-001",
        claim_b="Up to 75% Total Subsidy provided across all pump categories [SRC-002]",
        source_b_citation="SRC-002",
        explanation="Central rules define a strict 60% combined ceiling, whereas state promotional bulletins advertise 75%.",
        possible_reason="State notice may combine special tribal/SC/ST sub-quotas without disclosing general farmer rates.",
        what_to_verify="Confirm exact net contribution demand draft amount at the district agriculture office."
    )
    db.add(c1)

    o1 = OutdatedWarning(
        analysis_id=analysis.id,
        source_citation="SRC-002",
        publication_date="2024-02-14",
        collection_date=now,
        flag_text="State Notice was issued in early 2024 and does not incorporate 2025 Component-B benchmark price adjustments.",
        reason="Vendor pricing and component warranties were revised in the July 2025 MNRE operational update."
    )
    db.add(o1)

    u1 = UnansweredQuestion(
        analysis_id=analysis.id,
        question="What compensation is provided if empanelled vendor fails to resolve inverter breakdown within the mandated 72-hour SLA?",
        importance="Crop withering occurs rapidly during summer irrigation seasons without pump operation.",
        recommended_source="State Renewable Energy Development Agency (SREDA) Grievance Cell"
    )
    db.add(u1)

    chk1 = ChecklistItem(
        research_id=project.id,
        title="Verify whether your existing electricity meter must be surrendered prior to solar pump installation",
        why_it_matters="Prevents unexpected loss of grid power while waiting for solar energization.",
        suggested_source="Discom / Electricity Department Sub-Station",
        priority="High",
        is_completed=False,
        order_index=0
    )
    chk2 = ChecklistItem(
        research_id=project.id,
        title="Obtain hydrogeological certificate for borewell water table depth",
        why_it_matters="Ensures pump capacity (5HP vs 7.5HP) matches actual aquifer depth.",
        suggested_source="Ground Water Survey & Development Agency",
        priority="High",
        is_completed=False,
        order_index=1
    )
    chk3 = ChecklistItem(
        research_id=project.id,
        title="Confirm net out-of-pocket payment amount with bank and state portal",
        why_it_matters="Resolves conflicting 60% vs 75% subsidy rate statements.",
        suggested_source="District Agriculture Officer / PM-KUSUM Nodal Branch",
        priority="Medium",
        is_completed=False,
        order_index=2
    )
    db.add_all([chk1, chk2, chk3])

    conv = ChatConversation(research_id=project.id, user_id=user_id, created_at=now, updated_at=now)
    db.add(conv)
    db.commit()
    db.refresh(conv)

    msg = ChatMessage(
        conversation_id=conv.id,
        sender="assistant",
        text=(
            "Hello! I am your AI Research Assistant for **Solar Irrigation Pump Subsidy (PM-KUSUM)**.\n\n"
            "I cross-examined your 3 sources ([SRC-001], [SRC-002], [SRC-003]). I flagged a major missing electrical connection surrender clause, "
            "conflicting 60% vs 75% subsidy figures, and unaddressed 5-year vendor maintenance delays. What would you like to verify first?"
        ),
        citations_json='[{"citation_id": "SRC-001", "title": "MNRE PM-KUSUM Guidelines"}, {"citation_id": "SRC-003", "title": "Krishi Cooperative Field Audit"}]',
        is_fallback_or_demo=True,
        created_at=now
    )
    db.add(msg)
    db.commit()
    return project

def _seed_healthcare_project(db: Session, user_id: str, now: datetime.datetime) -> ResearchProject:
    title = "Telemedicine Prescriptions & Digital Health Record Portability"
    existing = db.query(ResearchProject).filter(
        ResearchProject.user_id == user_id,
        ResearchProject.title == title
    ).first()
    if existing:
        db.delete(existing)
        db.commit()

    project = ResearchProject(
        user_id=user_id,
        title=title,
        research_question="What legal requirements, controlled medicine exclusions, and cross-state licensing rules apply to telemedicine consultations?",
        topic="Healthcare & Wellbeing",
        location="National Healthcare Network",
        goal="Verify clinical validity, state medical board jurisdiction, and identify prohibited medication categories omitted from clinic advertising.",
        keywords="healthcare, telemedicine, prescription, doctor, clinic, medical records",
        status="analyzed",
        created_at=now,
        updated_at=now
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    src1 = Source(
        research_id=project.id,
        title="National Medical Commission Telemedicine Practice Guidelines",
        original_url="https://nmc.org.in/rules/telemedicine-guidelines",
        source_type="sample",
        citation_id="SRC-001",
        publication_date="2024-11-10",
        collected_at=now,
        status="ready",
        extracted_summary="Statutory clinical guidelines governing Registered Medical Practitioners (RMPs) providing remote consultation via video, audio, or chat.",
        raw_content="""National Medical Commission - Telemedicine Practice Guidelines
Statutory Mandate: Registered Medical Practitioners (RMPs) may consult remotely across state lines if registered on the National Medical Register.
Prescribing Restrictions: Schedule X medications (psychotropic, narcotics, habit-forming drugs) and anti-cancer therapeutics are STRICTLY PROHIBITED from remote prescription.
Record Keeping: Digital patient logs, consultation timestamps, and digital prescription copies must be maintained securely for a minimum of 3 years."""
    )

    src2 = Source(
        research_id=project.id,
        title="Digital Health Startup Tele-Consult Portal FAQ",
        original_url="https://healthnow-app.com/faqs-telehealth",
        source_type="sample",
        citation_id="SRC-002",
        publication_date="2025-01-05",
        collected_at=now,
        status="ready",
        extracted_summary="Commercial telehealth app claiming 24/7 instant doctor access and instant digital prescriptions delivered to doorsteps in 60 minutes.",
        raw_content="""HealthNow Telehealth Services - Patient FAQ
Anytime Access: Connect with top specialists within 10 minutes from your smartphone.
Prescriptions: Valid digital prescriptions generated instantly for all chronic and acute conditions, honored by all partner pharmacies.
Delivery: Medications dispatched immediately to your address with zero consultation paperwork required."""
    )
    db.add_all([src1, src2])
    db.commit()

    analysis = Analysis(
        research_id=project.id,
        executive_summary=(
            "Cross-examination of statutory Medical Commission guidelines [SRC-001] against commercial tele-health marketing [SRC-002] "
            "revealed severe information gaps. While the commercial portal claims instant prescriptions for 'all conditions', "
            "it completely omits mandatory Schedule X controlled substance exclusions and 3-year record retention mandates."
        ),
        limitations="Medical Notice: AI-generated information is for informational verification only and is not a substitute for qualified medical professionals. Grounded strictly in SRC-001 and SRC-002.",
        is_demo=True,
        created_at=now
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    f1 = Finding(
        analysis_id=analysis.id,
        title="Strict Prohibition on Schedule X Controlled Substances",
        explanation="Statutory guidelines categorically forbid remote issuance of Schedule X narcotic, psychiatric, or habit-forming medications.",
        supporting_evidence="Explicitly documented in National Medical Commission Guidelines [SRC-001].",
        citation_ids="SRC-001",
        evidence_strength="Strong"
    )
    db.add(f1)

    g1 = InformationGap(
        analysis_id=analysis.id,
        category="Controlled Medicine Exclusions",
        title="Omission of Prohibited Medication Categories in App Terms",
        explanation="The commercial clinic portal advertises prescriptions for 'all acute and chronic conditions' without disclosing that controlled substances cannot legally be prescribed remotely.",
        why_it_matters="Patients seeking refills for psychiatric or specialized medications will face unexpected order cancellation or legal pharmacy refusal.",
        sources_reviewed="SRC-001, SRC-002",
        priority="High",
        suggested_next_step="Check whether your required medication is on the Schedule X or prohibited list before paying consultation fees.",
        status="Not found in sources reviewed"
    )
    db.add(g1)

    c1 = Conflict(
        analysis_id=analysis.id,
        claim_a="Prescriptions strictly restricted: Schedule X and habit-forming drugs prohibited [SRC-001]",
        source_a_citation="SRC-001",
        claim_b="Instant digital prescriptions for all chronic and acute conditions [SRC-002]",
        source_b_citation="SRC-002",
        explanation="Marketing copy overgeneralizes prescribing capabilities, contradicting statutory medical commission restrictions.",
        possible_reason="Commercial landing page simplifies legal restrictions for advertising appeal.",
        what_to_verify="Confirm RMP registration number and verify the specific drug schedule classification."
    )
    db.add(c1)

    chk1 = ChecklistItem(
        research_id=project.id,
        title="Verify whether your prescription includes Schedule X or restricted compounds",
        why_it_matters="Ensures the prescription will be legally dispensed by registered pharmacies.",
        suggested_source="State Pharmacy Licensing Registry",
        priority="High",
        is_completed=False,
        order_index=0
    )
    db.add(chk1)
    db.commit()
    return project

def _seed_environment_project(db: Session, user_id: str, now: datetime.datetime) -> ResearchProject:
    title = "Municipal Flood Defense Readiness & Drainage Infrastructure"
    existing = db.query(ResearchProject).filter(
        ResearchProject.user_id == user_id,
        ResearchProject.title == title
    ).first()
    if existing:
        db.delete(existing)
        db.commit()

    project = ResearchProject(
        user_id=user_id,
        title=title,
        research_question="What information is missing from municipal reports regarding urban flood risk, stormwater capacity, and industrial runoff?",
        topic="Environment & Climate",
        location="Metropolitan River Basin",
        goal="Audit stormwater drainage discharge capacity, identify missing industrial effluent filtration data, and resolve conflicting project completion timelines.",
        keywords="environment, flood, drainage, stormwater, pollution, river, climate",
        status="analyzed",
        created_at=now,
        updated_at=now
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    src1 = Source(
        research_id=project.id,
        title="Municipal Corporation Monsoon Preparedness & Drainage Master Plan (2025)",
        original_url="https://citycorp.gov/drainage-masterplan-2025",
        source_type="sample",
        citation_id="SRC-001",
        publication_date="2025-04-10",
        collected_at=now,
        status="ready",
        extracted_summary="City engineering document detailing 450 km of stormwater drains, desilting milestones, and flood gate installations.",
        raw_content="""Municipal Engineering Department - Monsoon Stormwater Action Plan (2025)
Capacity Benchmark: City stormwater drainage system designed for peak rainfall intensity of 35 mm/hour.
Desilting Progress: 85% of primary arterial drains desilted as of April 2025. Pumping stations upgraded with automatic diesel back-up generators.
Schedules: Secondary canal desilting scheduled for completion by May 30, 2025."""
    )

    src2 = Source(
        research_id=project.id,
        title="State Pollution Control Board Industrial Effluent & Basin Flood Audit",
        original_url="https://spcb.state.gov/basin-audit-2024",
        source_type="sample",
        citation_id="SRC-002",
        publication_date="2024-09-18",
        collected_at=now,
        status="ready",
        extracted_summary="Pollution board audit documenting that actual monsoon rainfall routinely exceeds 65 mm/hour, causing overflow of untreated industrial effluents into residential zones.",
        raw_content="""State Pollution Control Board - Basin Environmental Risk Audit (Published Sept 2024)
Peak Rainfall Disparity: Over the last 5 monsoon seasons, peak hourly rainfall averaged 72 mm/hour, more than double the municipal stormwater design capacity (35 mm/hour).
Industrial Contamination: Heavy industrial discharge into secondary stormwater canals causes severe chemical runoff during inundation periods, with heavy metal traces exceeding permissible limits by 3.4x."""
    )
    db.add_all([src1, src2])
    db.commit()

    analysis = Analysis(
        research_id=project.id,
        executive_summary=(
            "Environmental cross-analysis reveals an acute design disparity between municipal infrastructure plans [SRC-001] "
            "and pollution board empirical records [SRC-002]. While the city designs drains for 35 mm/hour, actual rainfall exceeds 70 mm/hour, "
            "and municipal reports omit any chemical containment safeguards for industrial effluent mixing."
        ),
        limitations="Analysis is grounded in municipal and environmental board audit records [SRC-001, SRC-002].",
        is_demo=True,
        created_at=now
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    f1 = Finding(
        analysis_id=analysis.id,
        title="Stormwater Drainage Capacity Insufficient for Recorded Rainfall",
        explanation="The municipal system is built for 35 mm/hour, while environmental board data records regular monsoon peaks of 72 mm/hour.",
        supporting_evidence="Corroborated across SRC-001 and SRC-002.",
        citation_ids="SRC-001, SRC-002",
        evidence_strength="Strong"
    )
    db.add(f1)

    g1 = InformationGap(
        analysis_id=analysis.id,
        category="Hazardous Chemical Containment",
        title="Omission of Industrial Effluent Containment Protocols During Flooding",
        explanation="The municipal master plan focuses exclusively on water volume desilting and provides zero protocols for neutralizing toxic chemical discharge when industrial canals overflow into neighborhoods.",
        why_it_matters="Presents critical public health hazards to residents living adjacent to secondary canals.",
        sources_reviewed="SRC-001, SRC-002",
        priority="High",
        suggested_next_step="Request the Disaster Management Authority's hazardous material spill contingency annex.",
        status="Not found in sources reviewed"
    )
    db.add(g1)

    chk1 = ChecklistItem(
        research_id=project.id,
        title="Verify whether your residential zone falls within the 70mm/hour historical overflow flood contour",
        why_it_matters="Determines whether standard municipal pumping will prevent ground-floor inundation.",
        suggested_source="Disaster Management Hazard Map",
        priority="High",
        is_completed=False,
        order_index=0
    )
    db.add(chk1)
    db.commit()
    return project

def _seed_employment_project(db: Session, user_id: str, now: datetime.datetime) -> ResearchProject:
    title = "Remote Tech Engineer Offer: Tax Compliance & IP Assignment"
    existing = db.query(ResearchProject).filter(
        ResearchProject.user_id == user_id,
        ResearchProject.title == title
    ).first()
    if existing:
        db.delete(existing)
        db.commit()

    project = ResearchProject(
        user_id=user_id,
        title=title,
        research_question="What should I verify regarding cross-border taxation, IP ownership, and termination notice before signing this remote offer?",
        topic="Employment & Career",
        location="Remote / Global",
        goal="Identify omitted dual-taxation terms, conflicting notice periods, and broad IP assignment clauses in employer handbook.",
        keywords="job, career, remote work, salary, contract, ip assignment, tax",
        status="analyzed",
        created_at=now,
        updated_at=now
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    src1 = Source(
        research_id=project.id,
        title="Global Tech Employer Remote Employment Agreement (Draft)",
        original_url="https://employer.internal/docs/offer-terms-2025",
        source_type="sample",
        citation_id="SRC-001",
        publication_date="2025-05-12",
        collected_at=now,
        status="ready",
        extracted_summary="Contract draft specifying compensation in USD, contractor vs employee classification, and 24/7 perpetual IP assignment.",
        raw_content="""Remote Employment Terms of Agreement
Compensation: $95,000 USD annually paid monthly via international wire.
Intellectual Property: The Employee irrevocably assigns to the Company all rights, titles, and interests in any intellectual property created during the period of engagement, whether developed on company equipment or personal devices.
Notice Period: 30 days written notice required by either party."""
    )

    src2 = Source(
        research_id=project.id,
        title="National Labor Law & Cross-Border Remote Worker Compliance Guide",
        original_url="https://labor-law-advisory.org/remote-tax-guide",
        source_type="sample",
        citation_id="SRC-002",
        publication_date="2024-12-01",
        collected_at=now,
        status="ready",
        extracted_summary="Legal analysis explaining permanent establishment tax risks and invalidity of overly broad personal device IP assignment clauses.",
        raw_content="""Remote Contractor Legal Advisory
Tax Liability: Overseas contractors receiving direct foreign wire payments are personally liable for local advance tax, GST registration (if exceeding services threshold), and withholding taxes.
IP Carve-Outs: Blanket IP clauses claiming personal projects created on personal equipment outside working hours are unenforceable in several jurisdictions unless explicitly carved out."""
    )
    db.add_all([src1, src2])
    db.commit()

    analysis = Analysis(
        research_id=project.id,
        executive_summary=(
            "Analysis of remote employment offer terms [SRC-001] against cross-border labor compliance standards [SRC-002] "
            "revealed critical omissions regarding local statutory taxation and overbroad intellectual property claims."
        ),
        limitations="Grounding restricted to contract draft and legal advisory texts [SRC-001, SRC-002].",
        is_demo=True,
        created_at=now
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    f1 = Finding(
        analysis_id=analysis.id,
        title="Overbroad IP Assignment Includes Personal Device Projects",
        explanation="Contract draft claims all IP created during employment period, regardless of whether personal devices were used.",
        supporting_evidence="Documented in Employment Agreement Draft [SRC-001].",
        citation_ids="SRC-001",
        evidence_strength="Strong"
    )
    db.add(f1)

    g1 = InformationGap(
        analysis_id=analysis.id,
        category="Tax Withholding & Social Security",
        title="Omission of Employer Tax Withholding and Social Security Declarations",
        explanation="The offer does not specify whether the employer operates an Employer of Record (EOR) locally or treats the worker as an independent contractor liable for local commercial tax.",
        why_it_matters="Leaves the worker facing surprise end-of-year tax liability and self-funded health coverage.",
        sources_reviewed="SRC-001",
        priority="High",
        suggested_next_step="Request explicit confirmation of EOR status and local tax withholding deductions.",
        status="Not found in sources reviewed"
    )
    db.add(g1)

    chk1 = ChecklistItem(
        research_id=project.id,
        title="Request written IP carve-out annex listing pre-existing personal open source projects",
        why_it_matters="Protects personal software code from automatic employer ownership claims.",
        suggested_source="Employer Legal Counsel",
        priority="High",
        is_completed=False,
        order_index=0
    )
    db.add(chk1)
    db.commit()
    return project

def _seed_education_project(db: Session, user_id: str, now: datetime.datetime) -> ResearchProject:
    title = "Higher Education International Fellowship & Research Grant"
    existing = db.query(ResearchProject).filter(
        ResearchProject.user_id == user_id,
        ResearchProject.title == title
    ).first()
    if existing:
        db.delete(existing)
        db.commit()

    project = ResearchProject(
        user_id=user_id,
        title=title,
        research_question="What should I verify before applying for this international research fellowship?",
        topic="Education & Higher Studies",
        location="Global Academic Exchange",
        goal="Verify complete eligibility rules, conflicting deadline claims, required documentation, and missing renewal terms before filing.",
        keywords="education, fellowship, grant, college, university, transcript",
        status="analyzed",
        created_at=now,
        updated_at=now
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    src1 = Source(
        research_id=project.id,
        title="Global Academic Scholars Fellowship Guidelines (2025/2026)",
        original_url="https://www.globalfellows.org/guidelines-2025",
        source_type="sample",
        citation_id="SRC-001",
        publication_date="2025-08-15",
        collected_at=now,
        status="ready",
        extracted_summary="Official guidelines covering GPA requirements, primary award amount ($15,000/yr), October 15 application deadline, and document submission portal.",
        raw_content="""Global Academic Scholars Award - Official 2025/2026 Academic Year Guidelines
Eligibility: Candidates must maintain a minimum cumulative GPA of 3.5 out of 4.0 and be enrolled full-time in an accredited STEM or public policy degree program.
Award Value: Up to $15,000 per academic year applied directly toward tuition and institutional fees.
Deadline: All application packages, including personal statement and academic records, must be submitted via the online portal by October 15, 2025 at 11:59 PM EST.
Documentation: Requires two academic letters of recommendation, official institutional transcript submitted directly by the registrar, and a 1,000-word statement of intent."""
    )

    src2 = Source(
        research_id=project.id,
        title="Regional Education Advisory Bulletin (2024)",
        original_url="https://www.regionaledboard.state.gov/notices/2024/aid-program",
        source_type="sample",
        citation_id="SRC-002",
        publication_date="2024-03-10",
        collected_at=now,
        status="ready",
        extracted_summary="Regional advisory bulletin noting June 30, 2024 deadline and electronic PDF transcript acceptance.",
        raw_content="""Regional Education Board Advisory Bulletin (Published March 2024)
Application Deadlines: State verification window closes June 30, 2024. All regional applicants must hold a 3.2 GPA.
Transcripts: Unofficial electronic student copy transcripts uploaded in PDF format are accepted for initial committee screening."""
    )
    db.add_all([src1, src2])
    db.commit()

    analysis = Analysis(
        research_id=project.id,
        executive_summary=(
            "Cross-source analysis of academic fellowship guidelines reveals conflicting deadline dates "
            "(October 15, 2025 vs June 30, 2024), contradictory transcript guidelines (Official registrar sealed vs Unofficial PDF), "
            "and omitted sophomore renewal conditions."
        ),
        limitations="Grounding restricted to reviewed educational sources [SRC-001, SRC-002].",
        is_demo=True,
        created_at=now
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    f1 = Finding(
        analysis_id=analysis.id,
        title="Core Eligibility and Award Cap Confirmed",
        explanation="Official guidelines require full-time enrollment with a minimum 3.5 cumulative GPA, with funding capped at $15,000/year disbursed to the university bursar.",
        supporting_evidence="Corroborated across SRC-001 and SRC-002.",
        citation_ids="SRC-001, SRC-002",
        evidence_strength="Strong"
    )
    db.add(f1)

    g1 = InformationGap(
        analysis_id=analysis.id,
        category="Continuing Renewal Terms",
        title="Missing Multi-Year Renewal Conditions & GPA Thresholds",
        explanation="The official documentation provides zero terms for retaining the fellowship after Year 1.",
        why_it_matters="Leaves students facing unexpected tuition obligations in subsequent academic years.",
        sources_reviewed="SRC-001, SRC-002",
        priority="High",
        suggested_next_step="Request written confirmation of continuing renewal policies from the fellowship committee.",
        status="Not found in sources reviewed"
    )
    db.add(g1)

    chk1 = ChecklistItem(
        research_id=project.id,
        title="Obtain written copy of Year 2 renewal criteria and retention GPA threshold",
        why_it_matters="Prevents unexpected loss of funding after initial academic year.",
        suggested_source="Fellowship Aid Committee",
        priority="High",
        is_completed=False,
        order_index=0
    )
    db.add(chk1)
    db.commit()
    return project
