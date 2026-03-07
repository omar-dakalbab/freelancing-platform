import { AdminJobsView } from "@/features/admin/admin-jobs-view";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Jobs" };

export default function AdminJobsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
        <p className="mt-1 text-gray-500">Monitor and moderate job postings</p>
      </div>
      <AdminJobsView />
    </div>
  );
}
