"use client";
import { useEffect, useState, useCallback } from "react";
import CrawlForm from "@/app/components/CrawlForm";
import JobCard from "@/app/components/JobCard";
import SearchBar from "@/app/components/SearchBar";
import { getJobs } from "@/app/lib/api";

export default function Home() {
  const [jobs, setJobs] = useState<any[]>([]);

  const fetchJobs = useCallback(async () => {
    const data = await getJobs();
    setJobs(data);
  }, []);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000); // auto-refresh every 5s
    return () => clearInterval(interval);
  }, [fetchJobs]);

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🕷️ Web Crawler</h1>
          <p className="text-gray-500 text-sm mt-1">CN Project — Automated Data Extraction & Indexing</p>
        </div>

        <CrawlForm onJobStarted={fetchJobs} />

        <SearchBar />

        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Crawl Jobs</h2>
          {jobs.length === 0 ? (
            <p className="text-sm text-gray-400">No jobs yet. Start a crawl above.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} onDeleted={fetchJobs} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}