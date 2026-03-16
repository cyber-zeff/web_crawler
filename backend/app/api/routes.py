from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel, HttpUrl
from app.db.supabase import supabase
from app.crawler.engine import crawl_job

router = APIRouter()

class CrawlRequest(BaseModel):
    seed_url: str
    max_depth: int = 2
    max_pages: int = 100
    delay: float = 1.0

# Start a new crawl job
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

# Get all jobs
@router.get("/jobs")
def get_jobs():
    result = supabase.table("crawl_jobs").select("*").order("created_at", desc=True).execute()
    return result.data

# Get single job status
@router.get("/jobs/{job_id}")
def get_job(job_id: str):
    result = supabase.table("crawl_jobs").select("*").eq("id", job_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")
    return result.data[0]

# Get pages for a job
@router.get("/jobs/{job_id}/pages")
def get_pages(job_id: str, limit: int = 50, offset: int = 0):
    result = supabase.table("pages")\
        .select("id, url, title, status_code, depth, word_count, crawled_at")\
        .eq("job_id", job_id)\
        .range(offset, offset + limit - 1)\
        .execute()
    return result.data

# Full-text search across pages
@router.get("/search")
def search_pages(q: str, job_id: str = None):
    query = supabase.table("pages").select("id, url, title, word_count, job_id")
    if job_id:
        query = query.eq("job_id", job_id)
    result = query.text_search("content", q, config="english").limit(20).execute()
    return result.data

# Export pages as JSON
@router.get("/jobs/{job_id}/export")
def export_pages(job_id: str):
    pages = supabase.table("pages").select("*").eq("job_id", job_id).execute()
    links = supabase.table("links").select("*").eq("job_id", job_id).execute()
    return {
        "pages": pages.data,
        "links": links.data
    }

# Delete a job and all its data
@router.delete("/jobs/{job_id}")
def delete_job(job_id: str):
    supabase.table("crawl_jobs").delete().eq("id", job_id).execute()
    return {"deleted": job_id}