import re
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import pypdf
import docx
import bs4
import requests

from app.core.security import is_safe_url

def clean_and_normalize_text(text: str) -> str:
    """Normalize whitespace and strip unprintable characters."""
    if not text:
        return ""
    # Normalize unicode spaces and tabs
    text = re.sub(r'[\r\t\f\v]', ' ', text)
    # Remove multiple spaces
    text = re.sub(r' +', ' ', text)
    # Normalize multiple newlines
    text = re.sub(r'\n\s*\n+', '\n\n', text)
    return text.strip()

def chunk_text(text: str, chunk_size_words: int = 400, overlap_words: int = 50) -> List[str]:
    """Split clean text into semantic chunks with overlap."""
    words = text.split()
    if not words:
        return []
    if len(words) <= chunk_size_words:
        return [" ".join(words)]
        
    chunks = []
    step = chunk_size_words - overlap_words
    for i in range(0, len(words), step):
        chunk = " ".join(words[i:i + chunk_size_words])
        if chunk.strip():
            chunks.append(chunk)
        if i + chunk_size_words >= len(words):
            break
    return chunks

def extract_from_pdf(file_path: Path) -> Tuple[str, List[Dict]]:
    """Extract text and metadata from PDF using pypdf."""
    reader = pypdf.PdfReader(str(file_path))
    full_text_parts = []
    pages_metadata = []
    
    for idx, page in enumerate(reader.pages):
        page_text = page.extract_text() or ""
        clean_page_text = clean_and_normalize_text(page_text)
        if clean_page_text:
            full_text_parts.append(clean_page_text)
            pages_metadata.append({
                "page": idx + 1,
                "length": len(clean_page_text)
            })
            
    full_text = "\n\n".join(full_text_parts)
    return full_text, pages_metadata

def extract_from_docx(file_path: Path) -> Tuple[str, List[Dict]]:
    """Extract text from DOCX paragraphs and tables."""
    doc = docx.Document(str(file_path))
    parts = []
    
    for p in doc.paragraphs:
        t = p.text.strip()
        if t:
            parts.append(t)
            
    for table in doc.tables:
        for row in table.rows:
            row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
            if row_text:
                parts.append(row_text)
                
    full_text = clean_and_normalize_text("\n\n".join(parts))
    return full_text, [{"sections": len(parts)}]

def extract_from_txt(file_path: Path) -> Tuple[str, List[Dict]]:
    """Extract text from plain text file."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
    except UnicodeDecodeError:
        with open(file_path, "r", encoding="latin-1") as f:
            text = f.read()
    full_text = clean_and_normalize_text(text)
    return full_text, []

def extract_from_url(url: str) -> Tuple[str, Optional[str], Optional[str]]:
    """
    Extract readable text from a URL with SSRF protection.
    Returns (cleaned_text, title, publication_date).
    """
    if not is_safe_url(url):
        raise ValueError("URL points to a restricted or private internal address (SSRF Protection).")
        
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 DigitalDarkSpot/1.0"
    }
    
    response = requests.get(url, headers=headers, timeout=12)
    response.raise_for_status()
    
    soup = bs4.BeautifulSoup(response.text, "html.parser")
    
    # Remove script, style, nav, footer, header tags
    for tag in soup(["script", "style", "nav", "footer", "header", "aside", "noscript", "svg"]):
        tag.decompose()
        
    title = soup.title.string.strip() if (soup.title and soup.title.string) else None
    
    # Attempt to extract publication date from meta tags
    pub_date = None
    date_meta = soup.find("meta", {"property": "article:published_time"}) or \
                soup.find("meta", {"name": "pubdate"}) or \
                soup.find("meta", {"name": "date"}) or \
                soup.find("time")
    if date_meta:
        if date_meta.name == "time" and date_meta.get("datetime"):
            pub_date = date_meta["datetime"]
        elif hasattr(date_meta, "get") and date_meta.get("content"):
            pub_date = date_meta["content"]
        elif hasattr(date_meta, "text") and date_meta.text:
            pub_date = date_meta.text.strip()
            
    # Extract main content
    main_el = soup.find("main") or soup.find("article") or soup.find("div", {"id": "content"}) or soup.body
    if main_el:
        text = main_el.get_text(separator="\n")
    else:
        text = soup.get_text(separator="\n")
        
    cleaned = clean_and_normalize_text(text)
    return cleaned, title, pub_date
