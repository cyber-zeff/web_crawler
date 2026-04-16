from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

def parse_page(html: str, base_url: str) -> dict:
    soup = BeautifulSoup(html, "lxml")

    # Title
    title = ""
    if soup.title and soup.title.string:
        title = soup.title.string.strip()

    # Extract headings explicitly
    headings = []
    for tag in soup.find_all(["h1", "h2", "h3"]):
        text = tag.get_text(strip=True)
        if text:
            headings.append(f"[{tag.name.upper()}] {text}")

    # Extract meta description
    meta_desc = ""
    meta = soup.find("meta", attrs={"name": "description"})
    if meta and meta.get("content"):
        meta_desc = meta["content"].strip()

    # Remove noise
    for tag in soup(["script", "style", "nav", "footer", "header", "noscript", "iframe"]):
        tag.decompose()

    body_text = soup.get_text(separator=" ", strip=True)

    # Build rich content block
    content_parts = []
    if meta_desc:
        content_parts.append(f"[META] {meta_desc}")
    if headings:
        content_parts.append("[HEADINGS]\n" + "\n".join(headings))
    content_parts.append("[BODY]\n" + body_text)

    full_content = "\n\n".join(content_parts)
    word_count = len(body_text.split())

    # Extract links
    links = []
    seen = set()
    for a_tag in soup.find_all("a", href=True):
        href = a_tag["href"].strip()
        anchor = a_tag.get_text(strip=True)
        absolute = urljoin(base_url, href)
        parsed = urlparse(absolute)

        if parsed.scheme in ("http", "https") and absolute not in seen:
            seen.add(absolute)
            links.append({
                "url": absolute,
                "anchor_text": anchor[:200] if anchor else ""
            })

    return {
        "title": title[:500],
        "content": full_content[:50000],
        "word_count": word_count,
        "links": links
    }

def is_same_domain(url: str, base_url: str) -> bool:
    return urlparse(url).netloc == urlparse(base_url).netloc