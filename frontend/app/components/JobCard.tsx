"use client";
import { useRouter } from "next/navigation";
import { deleteJob, stopCrawl } from "../lib/api";
import { Trash2, StopCircle } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  running: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  stopped: "bg-gray-100 text-gray-600",
};

export default function JobCard({ job, onDeleted, onStopped }: { job: any; onDeleted: () => void; onStopped: () => void }) {
  const router = useRouter();

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    await deleteJob(job.id);
    onDeleted();
  }

  async function handleStop(e: React.MouseEvent) {
    e.stopPropagation();
    await stopCrawl(job.id);
    onStopped();
  }

  return (
    <div
      onClick={() => router.push(`/jobs/${job.id}`)}
      className="bg-white rounded-2xl shadow p-5 cursor-pointer hover:shadow-md transition space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-blue-600 truncate max-w-[70%]">{job.seed_url}</p>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[job.status] || "bg-gray-100 text-gray-600"}`}>
          {job.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 rounded-lg py-2">
          <p className="text-lg font-bold text-gray-800">{job.pages_crawled}</p>
          <p className="text-xs text-gray-500">Pages</p>
        </div>
        <div className="bg-gray-50 rounded-lg py-2">
          <p className="text-lg font-bold text-gray-800">{job.max_depth}</p>
          <p className="text-xs text-gray-500">Depth</p>
        </div>
        <div className="bg-gray-50 rounded-lg py-2">
          <p className="text-lg font-bold text-gray-800">{job.max_pages}</p>
          <p className="text-xs text-gray-500">Max Pages</p>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-gray-400">
        <span>{new Date(job.created_at).toLocaleString()}</span>
        <div className="flex gap-2">
          {job.status === "running" && (
            <button onClick={handleStop} title="Stop crawl"
              className="text-orange-400 hover:text-orange-600 transition">
              <StopCircle size={16} />
            </button>
          )}
          <button onClick={handleDelete} title="Delete job"
            className="text-red-400 hover:text-red-600 transition">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}