const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const startCrawl = (data: { seed_url: string; max_depth: number; max_pages: number; delay: number }) =>
  apiFetch("/api/crawl", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });

export const getJobs = () => apiFetch("/api/jobs");
export const getJob = (id: string) => apiFetch(`/api/jobs/${id}`);
export const getPages = (id: string, limit = 50, offset = 0) => apiFetch(`/api/jobs/${id}/pages?limit=${limit}&offset=${offset}`);
export const getPageDetail = (pageId: string) => apiFetch(`/api/pages/${pageId}`);
export const searchPages = (q: string, jobId?: string) => apiFetch(`/api/search?q=${encodeURIComponent(q)}${jobId ? `&job_id=${jobId}` : ""}`);
export const stopCrawl = (id: string) => apiFetch(`/api/jobs/${id}/stop`, { method: "POST" });
export const deleteJob = (id: string) => apiFetch(`/api/jobs/${id}`, { method: "DELETE" });
export const exportJob = (id: string) => apiFetch(`/api/jobs/${id}/export`);