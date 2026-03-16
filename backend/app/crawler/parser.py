from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from typing import Optional

def parse_page(html: str, base_url: str) -> dict:
    soup = BeautifulSoup(html, "lxml")

    # Title
    title = ""
    if soup.title and soup.title.string:
        title = soup.title.string.strip()

    # Clean content — remove scripts/styles
    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()

    content = soup.get_text(separator=" ", strip=True)
    word_count = len(content.split())

    # Extract all links
    links = []
    for a_tag in soup.find_all("a", href=True):
        href = a_tag["href"].strip()
        anchor = a_tag.get_text(strip=True)
        absolute = urljoin(base_url, href)

        # Only keep http/https links
        parsed = urlparse(absolute)
        if parsed.scheme in ("http", "https"):
            links.append({
                "url": absolute,
                "anchor_text": anchor[:200] if anchor else ""
            })

    return {
        "title": title[:500],
        "content": content[:50000],  # cap at 50k chars
        "word_count": word_count,
        "links": links
    }

def is_same_domain(url: str, base_url: str) -> bool:
    return urlparse(url).netloc == urlparse(base_url).netloc