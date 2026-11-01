import ipaddress
import socket
import urllib.parse
from fastapi import HTTPException, status

def is_safe_url(url: str) -> bool:
    """
    SSRF Protection: Ensure the URL does not point to internal,
    private, loopback, link-local, or cloud metadata IP addresses.
    """
    try:
        parsed = urllib.parse.urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return False
            
        hostname = parsed.hostname
        if not hostname:
            return False
            
        # Check against common local hostnames
        if hostname.lower() in ("localhost", "127.0.0.1", "0.0.0.0", "metadata.google.internal", "169.254.169.254"):
            return False
            
        # Resolve IP and check if private
        try:
            ip_str = socket.gethostbyname(hostname)
            ip = ipaddress.ip_address(ip_str)
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast or ip.is_reserved:
                return False
        except Exception:
            # If resolution fails, treat with caution unless valid external hostname
            pass
            
        return True
    except Exception:
        return False

def validate_safe_url(url: str):
    if not is_safe_url(url):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The provided URL is invalid or points to a restricted internal network address (SSRF Protection)."
        )
