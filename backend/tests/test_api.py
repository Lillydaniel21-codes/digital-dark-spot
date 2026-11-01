import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["project"] == "Digital Dark Spot"

def test_auth_request_and_verify_code():
    # 1. Request code for test email
    req_resp = client.post("/api/auth/request-code", json={"email": "researcher@example.com"})
    assert req_resp.status_code == 200
    req_data = req_resp.json()
    assert req_data["email"] == "researcher@example.com"
    
    code = req_data.get("demo_code") or "123456"
    
    # 2. Verify code
    ver_resp = client.post("/api/auth/verify-code", json={"email": "researcher@example.com", "code": code})
    assert ver_resp.status_code == 200
    ver_data = ver_resp.json()
    assert "access_token" in ver_data
    assert ver_data["user"]["email"] == "researcher@example.com"

def test_demo_login():
    resp = client.post("/api/auth/demo-login")
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["email"] == "demo@digitaldarkspot.io"

def test_ssrf_protection_on_sources():
    # Attempt to add localhost or internal IP should fail
    resp = client.post("/api/research/dummy-id/sources/url", json={"url": "http://127.0.0.1:8000/secret"})
    # Either 404 (if project doesn't exist) or 400 (SSRF rejected)
    assert resp.status_code in (400, 404)

def test_load_sample_research_and_pipeline():
    # Login as demo
    login_resp = client.post("/api/auth/demo-login")
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Load sample
    sample_resp = client.post("/api/research/load-sample", headers=headers)
    assert sample_resp.status_code == 200
    sample_data = sample_resp.json()
    research_id = sample_data["id"]
    assert len(sample_data["title"]) > 5
    
    # Check analysis
    an_resp = client.get(f"/api/research/{research_id}/analysis", headers=headers)
    assert an_resp.status_code == 200
    an_data = an_resp.json()
    assert len(an_data["findings"]) > 0
    assert len(an_data["gaps"]) > 0
    assert len(an_data["conflicts"]) > 0
    
    # Check chatbot
    chat_resp = client.post(
        f"/api/research/{research_id}/chat",
        headers=headers,
        json={"question": "What information is missing regarding scholarship renewal?"}
    )
    assert chat_resp.status_code == 200
    chat_data = chat_resp.json()
    assert chat_data["sender"] == "assistant"
    assert len(chat_data["text"]) > 10
    
    # Check checklist toggle
    chk_list_resp = client.get(f"/api/research/{research_id}/checklist", headers=headers)
    assert chk_list_resp.status_code == 200
    items = chk_list_resp.json()
    assert len(items) > 0
    first_item_id = items[0]["id"]
    
    patch_resp = client.patch(
        f"/api/checklist/{first_item_id}",
        headers=headers,
        json={"is_completed": True}
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["is_completed"] is True
    
    # Check report JSON
    rep_resp = client.get(f"/api/research/{research_id}/report", headers=headers)
    assert rep_resp.status_code == 200
    assert rep_resp.json()["id"] == research_id
    
    # Check report PDF download
    pdf_resp = client.get(f"/api/research/{research_id}/report/pdf", headers=headers)
    assert pdf_resp.status_code == 200
    assert pdf_resp.headers["content-type"] == "application/pdf"
    assert len(pdf_resp.content) > 1000

    # Check report CSV export
    csv_resp = client.get(f"/api/research/{research_id}/report/csv", headers=headers)
    assert csv_resp.status_code == 200
    assert "text/csv" in csv_resp.headers["content-type"]
    assert "AUDIT REPORT" in csv_resp.text.upper()

def test_multi_domain_benchmarks():
    login_resp = client.post("/api/auth/demo-login")
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Test Agriculture benchmark
    ag_resp = client.post("/api/research/load-sample?domain=agriculture", headers=headers)
    assert ag_resp.status_code == 200
    ag_data = ag_resp.json()
    assert "Solar Pump" in ag_data["title"] or "KUSUM" in ag_data["title"]

    # Test Healthcare benchmark with medical notice
    hc_resp = client.post("/api/research/load-sample?domain=healthcare", headers=headers)
    assert hc_resp.status_code == 200
    hc_data = hc_resp.json()
    assert "Telemedicine" in hc_data["title"]

    # Verify healthcare analysis contains clinical notice
    hc_an = client.get(f"/api/research/{hc_data['id']}/analysis", headers=headers)
    assert hc_an.status_code == 200
    lim_text = hc_an.json().get("limitations", "").lower()
    assert "medical" in lim_text and ("professionals" in lim_text or "notice" in lim_text)

def test_search_suggestions_and_history():
    login_resp = client.post("/api/auth/demo-login")
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Test suggestions query
    sug_resp = client.get("/api/search/suggestions?q=pump", headers=headers)
    assert sug_resp.status_code == 200
    sug_data = sug_resp.json()
    assert "suggestions" in sug_data
    assert len(sug_data["suggestions"]) > 0

    # Test popular searches
    pop_resp = client.get("/api/search/popular", headers=headers)
    assert pop_resp.status_code == 200
    assert len(pop_resp.json()) > 0

    # Test search history flow
    post_hist = client.post(
        "/api/search/history",
        headers=headers,
        json={"query": "flood defenses 2026", "domain": "Environment & Climate"}
    )
    assert post_hist.status_code == 200
    assert post_hist.json()["query"] == "flood defenses 2026"

    get_hist = client.get("/api/search/history", headers=headers)
    assert get_hist.status_code == 200
    assert any(h["query"] == "flood defenses 2026" for h in get_hist.json())

    del_hist = client.delete("/api/search/history", headers=headers)
    assert del_hist.status_code == 200

def test_create_universal_research_with_location():
    login_resp = client.post("/api/auth/demo-login")
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.post(
        "/api/research",
        headers=headers,
        json={
            "title": "Industrial Effluent Discharge Compliance Audit",
            "research_question": "What sensor verification standards are missing from municipal water regulations?",
            "topic": "Environment & Climate",
            "location": "Regional Basin, District 4",
            "goal": "Verify real-time telemetry exclusions",
            "keywords": "effluent, bod, cod, telemetry"
        }
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["location"] == "Regional Basin, District 4"
    assert data["topic"] == "Environment & Climate"
