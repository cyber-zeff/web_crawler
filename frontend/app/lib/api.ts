const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function startCrawl(data: {
  seed_url: string;
  max_depth: number;
  max_pages: number;
  delay: number;
}) {
  const res = await fetch(`${API_URL}/api/crawl`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getJobs() {
  const res = await fetch(`${API_URL}/api/jobs`);
  return res.json();
}

export async function getJob(jobId: string) {
  const res = await fetch(`${API_URL}/api/jobs/${jobId}`);
  return res.json();
}

export async function getPages(jobId: string, limit = 50, offset = 0) {
  const res = await fetch(`${API_URL}/api/jobs/${jobId}/pages?limit=${limit}&offset=${offset}`);
  return res.json();
}

export async function searchPages(q: string, jobId?: string) {
  const params = new URLSearchParams({ q });
  if (jobId) params.append("job_id", jobId);
  const res = await fetch(`${API_URL}/api/search?${params}`);
  return res.json();
}

export async function deleteJob(jobId: string) {
  await fetch(`${API_URL}/api/jobs/${jobId}`, { method: "DELETE" });
}

export async function exportJob(jobId: string) {
  const res = await fetch(`${API_URL}/api/jobs/${jobId}/export`);
  return res.json();
}