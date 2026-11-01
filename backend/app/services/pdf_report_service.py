import io
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

def generate_pdf_report(project_data: dict) -> io.BytesIO:
    """
    Generate a professional multi-page PDF research report from actual stored research data.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=6
    )
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        textColor=colors.HexColor('#4338ca'),
        spaceAfter=14
    )
    section_h1 = ParagraphStyle(
        'SecH1',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#1e293b'),
        spaceBefore=14,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#334155'),
        spaceAfter=4
    )
    meta_style = ParagraphStyle(
        'Meta',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        textColor=colors.HexColor('#64748b'),
        spaceAfter=8
    )
    
    story = []
    
    # Header Banner
    story.append(Paragraph("DIGITAL DARK SPOT", subtitle_style))
    story.append(Paragraph(f"Research Intelligence Report: {project_data.get('title', 'Research Project')}", title_style))
    story.append(Paragraph(f"<b>Research Question:</b> \"{project_data.get('research_question', '')}\"", body_style))
    story.append(Paragraph(f"Generated Date: {project_data.get('created_at', '')[:10]} | Status: {project_data.get('status', 'Analyzed').upper()}", meta_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#4338ca'), spaceAfter=12))
    
    analysis = project_data.get("analysis") or {}
    
    # 1. Executive Summary
    story.append(Paragraph("1. Executive Summary", section_h1))
    summary_text = analysis.get("executive_summary", "No executive summary available.")
    story.append(Paragraph(summary_text, body_style))
    story.append(Spacer(1, 8))
    
    # 2. Sources Reviewed
    story.append(Paragraph("2. Sources Reviewed", section_h1))
    sources = project_data.get("sources", [])
    if sources:
        src_table_data = [["Citation", "Source Title", "Type", "Publication Date"]]
        for s in sources:
            src_table_data.append([
                s.get("citation_id", "SRC"),
                Paragraph(s.get("title", "Untitled")[:55], body_style),
                s.get("source_type", "web").upper(),
                s.get("publication_date") or "N/A"
            ])
        src_table = Table(src_table_data, colWidths=[65, 270, 75, 100])
        src_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#0f172a')),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 8.5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ]))
        story.append(src_table)
    else:
        story.append(Paragraph("No sources registered for this analysis.", body_style))
    story.append(Spacer(1, 10))

    # 3. Information Gaps
    story.append(Paragraph("3. Detected Information Gaps (Missing Details)", section_h1))
    gaps = analysis.get("gaps", [])
    if gaps:
        for g in gaps:
            gap_box = [
                Paragraph(f"<b>{g.get('title')}</b> — Priority: <b>{g.get('priority')}</b> | Status: <i>{g.get('status')}</i>", body_style),
                Paragraph(f"<b>Explanation:</b> {g.get('explanation')}", body_style),
                Paragraph(f"<b>Why It Matters:</b> {g.get('why_it_matters')}", body_style),
                Paragraph(f"<b>Suggested Action:</b> {g.get('suggested_next_step')}", body_style),
                Spacer(1, 4)
            ]
            story.append(KeepTogether(gap_box))
    else:
        story.append(Paragraph("No critical information gaps identified.", body_style))
    story.append(Spacer(1, 8))

    # 4. Conflicting Claims
    conflicts = analysis.get("conflicts", [])
    if conflicts:
        story.append(Paragraph("4. Conflicting Claims Across Sources", section_h1))
        for c in conflicts:
            conf_box = [
                Paragraph(f"<b>Claim A [{c.get('source_a_citation')}]:</b> {c.get('claim_a')}", body_style),
                Paragraph(f"<b>Claim B [{c.get('source_b_citation')}]:</b> {c.get('claim_b')}", body_style),
                Paragraph(f"<b>Analysis:</b> {c.get('explanation')} <i>(Possible reason: {c.get('possible_reason')})</i>", body_style),
                Paragraph(f"<b>What To Verify:</b> {c.get('what_to_verify')}", body_style),
                Spacer(1, 4)
            ]
            story.append(KeepTogether(conf_box))
        story.append(Spacer(1, 8))

    # 5. Potentially Outdated Information
    outdated = analysis.get("outdated_warnings", [])
    if outdated:
        story.append(Paragraph("5. Potentially Outdated Information", section_h1))
        for o in outdated:
            out_box = [
                Paragraph(f"<b>Source [{o.get('source_citation')}]:</b> {o.get('flag_text')}", body_style),
                Paragraph(f"<b>Reason for Warning:</b> {o.get('reason')}", body_style),
                Spacer(1, 4)
            ]
            story.append(KeepTogether(out_box))
        story.append(Spacer(1, 8))

    # 6. Prioritized Verification Checklist
    checklist = project_data.get("checklist", [])
    if checklist:
        story.append(Paragraph("6. Prioritized Verification Checklist", section_h1))
        for idx, item in enumerate(checklist):
            status_symbol = "[X]" if item.get("is_completed") else "[ ]"
            chk_box = [
                Paragraph(f"{status_symbol} <b>{idx+1}. {item.get('title')}</b> (Priority: {item.get('priority')})", body_style),
                Paragraph(f"   <i>Why:</i> {item.get('why_it_matters')} | <i>Target:</i> {item.get('suggested_source')}", body_style),
                Spacer(1, 2)
            ]
            story.append(KeepTogether(chk_box))
        story.append(Spacer(1, 8))

    # 7. Limitations & Disclaimers
    story.append(Paragraph("7. Methodological Limitations", section_h1))
    limitations = analysis.get("limitations", "Grounding is limited to supplied text chunks. Missing info was 'Not found in sources reviewed'.")
    story.append(Paragraph(limitations, meta_style))

    doc.build(story)
    buffer.seek(0)
    return buffer
