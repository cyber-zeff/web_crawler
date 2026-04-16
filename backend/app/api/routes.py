from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from app.db.supabase import supabase
from app.crawler.engine import crawl_job, cancel_job

router = APIRouter()

class CrawlRequest(BaseModel):
    seed_url: str
    max_depth: int = 2
    max_pages: int = 100
    delay: float = 1.0

@router.post("/crawl")
async def start_crawl(req: CrawlRequest, background_tasks: BackgroundTasks):
    result = supabase.table("crawl_jobs").insert({
        "seed_url": req.seed_url,
        "max_depth": req.max_depth,
        "max_pages": req.max_pages,
        "delay": req.delay,
        "status": "pending"
    }).execute()

    job = result.data[0]
    job_id = job["id"]

    background_tasks.add_task(
        crawl_job,
        job_id, req.seed_url, req.max_depth, req.max_pages, req.delay
    )

    return {"job_id": job_id, "status": "started"}

@router.post("/jobs/{job_id}/stop")
def stop_crawl(job_id: str):
    cancel_job(job_id)
    supabase.table("crawl_jobs").update({
        "status": "stopped",
        "updated_at": __import__('datetime').datetime.utcnow().isoformat()
    }).eq("id", job_id).execute()
    return {"job_id": job_id, "status": "stopped"}

@router.get("/jobs")
def get_jobs():
    result = supabase.table("crawl_jobs").select("*").order("created_at", desc=True).execute()
    return result.data

@router.get("/jobs/{job_id}")
def get_job(job_id: str):
    result = supabase.table("crawl_jobs").select("*").eq("id", job_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")
    return result.data[0]

@router.get("/jobs/{job_id}/pages")
def get_pages(job_id: str, limit: int = 50, offset: int = 0):
    result = supabase.table("pages")\
        .select("id, url, title, status_code, depth, word_count, crawled_at")\
        .eq("job_id", job_id)\
        .range(offset, offset + limit - 1)\
        .execute()
    return result.data

# NEW: full page detail including content
@router.get("/pages/{page_id}")
def get_page_detail(page_id: str):
    result = supabase.table("pages").select("*").eq("id", page_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Page not found")
    return result.data[0]

@router.get("/search")
def search_pages(q: str, job_id: str = None):
    query = supabase.table("pages").select("id, url, title, word_count, job_id, content")
    if job_id:
        query = query.eq("job_id", job_id)
    result = query.ilike("content", f"%{q}%").limit(20).execute()
    return result.data

@router.get("/jobs/{job_id}/export")
def export_pages(job_id: str):
    pages = supabase.table("pages").select("*").eq("job_id", job_id).execute()
    links = supabase.table("links").select("*").eq("job_id", job_id).execute()
    return {"pages": pages.data, "links": links.data}

@router.delete("/jobs/{job_id}")
def delete_job(job_id: str):
    cancel_job(job_id)
    supabase.table("crawl_jobs").delete().eq("id", job_id).execute()
    return {"deleted": job_id}