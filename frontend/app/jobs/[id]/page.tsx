"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getJob, getPages, exportJob } from "@/app/lib/api";
import SearchBar from "@/app/components/SearchBar";
import { Download, ArrowLeft, X, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function JobPage() {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [selectedPage, setSelectedPage] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const [j, p] = await Promise.all([getJob(id as string), getPages(id as string)]);
      setJob(j);
      setPages(p);
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [id]);

  async function handleExport() {
    const data = await exportJob(id as string);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crawl-${id}.json`;
    a.click();
  }

  if (!job) return <div className="p-10 text-gray-500">Loading...</div>;

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
            <ArrowLeft size={16} /> Back
          </Link>
          <button onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition">
            <Download size={15} /> Export JSON
          </button>
        </div>

        {/* Job stats */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-2">
          <p className="text-blue-600 font-semibold truncate">{job.seed_url}</p>
          <div className="grid grid-cols-4 gap-4 text-center mt-4">
            {[
              { label: "Status", value: job.status },
              { label: "Pages Crawled", value: job.pages_crawled },
              { label: "Max Depth", value: job.max_depth },
              { label: "Max Pages", value: job.max_pages },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-xl py-3">
                <p className="text-xl font-bold text-gray-800">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Search This Job</h2>
          <SearchBar jobId={id as string} />
        </div>

        {/* Pages list */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-gray-700 mb-4">
            Crawled Pages ({pages.length}) —{" "}
            <span className="text-sm font-normal text-gray-400">click any row to view extracted content</span>
          </h2>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {pages.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPage(p)}
                className="flex items-center justify-between border-b border-gray-100 py-2 gap-4 cursor-pointer hover:bg-gray-50 px-2 rounded-lg transition"
              >
                <div className="min-w-0">
                  <p className="text-blue-600 text-sm font-medium truncate">{p.title || "(no title)"}</p>
                  <p className="text-xs text-gray-400 truncate">{p.url}</p>
                </div>
                <div className="flex gap-3 text-xs text-gray-500 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${p.status_code === 200 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {p.status_code}
                  </span>
                  <span>depth {p.depth}</span>
                  <span>{p.word_count}w</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Page detail modal */}
      {selectedPage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPage(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between p-5 border-b border-gray-100">
              <div className="min-w-0 pr-4">
                <h3 className="font-semibold text-gray-800 text-base truncate">
                  {selectedPage.title || "(no title)"}
                </h3>
                <a
                  href={selectedPage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5 truncate"
                >
                  {selectedPage.url} <ExternalLink size={11} />
                </a>
              </div>
              <button onClick={() => setSelectedPage(null)}
                className="text-gray-400 hover:text-gray-600 transition shrink-0">
                <X size={20} />
              </button>
            </div>

            {/* Metadata row */}
            <div className="flex gap-4 px-5 py-3 bg-gray-50 text-xs text-gray-500 border-b border-gray-100">
              <span>🔗 Depth: <strong>{selectedPage.depth}</strong></span>
              <span>📄 Status: <strong>{selectedPage.status_code}</strong></span>
              <span>📝 Words: <strong>{selectedPage.word_count}</strong></span>
              <span>🕒 {new Date(selectedPage.crawled_at).toLocaleString()}</span>
            </div>

            {/* Extracted text content */}
            <div className="p-5 overflow-y-auto flex-1">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Extracted Text Content
              </h4>
              {selectedPage.content ? (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedPage.content}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic">No text content extracted.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}