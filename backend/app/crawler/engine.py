import aiohttp
import asyncio
from urllib.parse import urlparse
from datetime import datetime

from app.crawler.parser import parse_page, is_same_domain
from app.crawler.robots import is_allowed
from app.db.supabase import supabase

HEADERS = {
    "User-Agent": "WebCrawlerBot/1.0 (CN Project; Educational)"
}

async def crawl_job(job_id: str, seed_url: str, max_depth: int, max_pages: int, delay: float):
    # Mark job as running
    supabase.table("crawl_jobs").update({
        "status": "running",
        "updated_at": datetime.utcnow().isoformat()
    }).eq("id", job_id).execute()

    visited = set()
    queue = [(seed_url, 0)]  # (url, depth)
    pages_crawled = 0

    try:
        async with aiohttp.ClientSession(headers=HEADERS) as session:
            while queue and pages_crawled < max_pages:
                url, depth = queue.pop(0)

                if url in visited or depth > max_depth:
                    continue

                # Check robots.txt
                if not await is_allowed(url):
                    continue

                visited.add(url)

                try:
                    async with session.get(
                        url,
                        timeout=aiohttp.ClientTimeout(total=10),
                        allow_redirects=True,
                        ssl=False
                    ) as response:
                        status_code = response.status
                        content_type = response.headers.get("Content-Type", "")

                        if status_code != 200 or "text/html" not in content_type:
                            # Still log the page, just no content
                            supabase.table("pages").upsert({
                                "job_id": job_id,
                                "url": url,
                                "status_code": status_code,
                                "depth": depth,
                                "content_type": content_type
                            }).execute()
                            continue

                        html = await response.text(errors="replace")
                        parsed = parse_page(html, url)

                        # Save page
                        supabase.table("pages").upsert({
                            "job_id": job_id,
                            "url": url,
                            "title": parsed["title"],
                            "content": parsed["content"],
                            "status_code": status_code,
                            "depth": depth,
                            "content_type": content_type,
                            "word_count": parsed["word_count"],
                            "crawled_at": datetime.utcnow().isoformat()
                        }).execute()

                        # Save links
                        for link in parsed["links"]:
                            supabase.table("links").upsert({
                                "job_id": job_id,
                                "source_url": url,
                                "target_url": link["url"],
                                "anchor_text": link["anchor_text"]
                            }).execute()

                            # Queue same-domain links
                            if (
                                depth < max_depth
                                and link["url"] not in visited
                                and is_same_domain(link["url"], seed_url)
                            ):
                                queue.append((link["url"], depth + 1))

                        pages_crawled += 1

                        # Update progress
                        supabase.table("crawl_jobs").update({
                            "pages_crawled": pages_crawled,
                            "updated_at": datetime.utcnow().isoformat()
                        }).eq("id", job_id).execute()

                except Exception as e:
                    print(f"[ERROR] {url}: {e}")
                    continue

                await asyncio.sleep(delay)  # politeness delay

        # Mark complete
        supabase.table("crawl_jobs").update({
            "status": "completed",
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", job_id).execute()

    except Exception as e:
        supabase.table("crawl_jobs").update({
            "status": "failed",
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", job_id).execute()
        print(f"[FATAL] Job {job_id} failed: {e}")