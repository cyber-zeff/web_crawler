import aiohttp
import asyncio
from datetime import datetime
from app.crawler.parser import parse_page, is_same_domain
from app.crawler.robots import is_allowed
from app.db.supabase import supabase

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; WebCrawlerBot/1.0; +http://localhost)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive",
}

async def crawl_job(job_id: str, seed_url: str, max_depth: int, max_pages: int, delay: float):
    supabase.table("crawl_jobs").update({
        "status": "running",
        "updated_at": datetime.utcnow().isoformat()
    }).eq("id", job_id).execute()

    visited = set()
    queue = [(seed_url, 0)]
    pages_crawled = 0

    try:
        connector = aiohttp.TCPConnector(ssl=False, limit=5)
        timeout = aiohttp.ClientTimeout(total=15, connect=5)

        async with aiohttp.ClientSession(headers=HEADERS, connector=connector) as session:
            while queue and pages_crawled < max_pages:
                url, depth = queue.pop(0)

                if url in visited or depth > max_depth:
                    continue

                if not await is_allowed(url):
                    print(f"[ROBOTS] Blocked: {url}")
                    continue

                visited.add(url)

                try:
                    async with session.get(url, timeout=timeout, allow_redirects=True, max_redirects=5) as response:
                        status_code = response.status
                        content_type = response.headers.get("Content-Type", "")
                        final_url = str(response.url)

                        # Handle bot blocks
                        if status_code in (403, 401, 429, 999):
                            print(f"[BLOCKED] {url} → {status_code}")
                            supabase.table("pages").upsert({
                                "job_id": job_id,
                                "url": url,
                                "status_code": status_code,
                                "depth": depth,
                                "content_type": content_type,
                                "title": f"Blocked by server ({status_code})",
                                "content": "",
                                "word_count": 0,
                                "crawled_at": datetime.utcnow().isoformat()
                            }).execute()
                            continue

                        if status_code != 200:
                            supabase.table("pages").upsert({
                                "job_id": job_id,
                                "url": url,
                                "status_code": status_code,
                                "depth": depth,
                                "content_type": content_type,
                                "title": f"HTTP {status_code}",
                                "content": "",
                                "word_count": 0,
                                "crawled_at": datetime.utcnow().isoformat()
                            }).execute()
                            continue

                        # Only parse HTML
                        if "text/html" not in content_type:
                            continue

                        html = await response.text(errors="replace")

                        if not html or len(html.strip()) < 100:
                            print(f"[EMPTY] {url}")
                            continue

                        parsed = parse_page(html, final_url)

                        supabase.table("pages").upsert({
                            "job_id": job_id,
                            "url": final_url,
                            "title": parsed["title"],
                            "content": parsed["content"],
                            "status_code": status_code,
                            "depth": depth,
                            "content_type": content_type,
                            "word_count": parsed["word_count"],
                            "crawled_at": datetime.utcnow().isoformat()
                        }).execute()

                        # Save links & queue same-domain ones
                        for link in parsed["links"]:
                            target = link["url"]

                            supabase.table("links").upsert({
                                "job_id": job_id,
                                "source_url": final_url,
                                "target_url": target,
                                "anchor_text": link["anchor_text"]
                            }).execute()

                            if (
                                depth < max_depth
                                and target not in visited
                                and is_same_domain(target, seed_url)
                            ):
                                queue.append((target, depth + 1))

                        pages_crawled += 1
                        supabase.table("crawl_jobs").update({
                            "pages_crawled": pages_crawled,
                            "updated_at": datetime.utcnow().isoformat()
                        }).eq("id", job_id).execute()

                        print(f"[OK] ({pages_crawled}/{max_pages}) depth={depth} {final_url[:80]}")

                except asyncio.TimeoutError:
                    print(f"[TIMEOUT] {url}")
                    continue
                except aiohttp.ClientError as e:
                    print(f"[CLIENT ERROR] {url}: {e}")
                    continue
                except Exception as e:
                    print(f"[ERROR] {url}: {e}")
                    continue

                await asyncio.sleep(delay)

        supabase.table("crawl_jobs").update({
            "status": "completed",
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", job_id).execute()
        print(f"[DONE] Job {job_id} — {pages_crawled} pages crawled")

    except Exception as e:
        supabase.table("crawl_jobs").update({
            "status": "failed",
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", job_id).execute()
        print(f"[FATAL] Job {job_id}: {e}")