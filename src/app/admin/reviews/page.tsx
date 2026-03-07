import { AdminReviewsView } from "@/features/admin/admin-reviews-view";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reviews" };

export default function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="mt-1 text-gray-500">Moderate platform reviews</p>
      </div>
      <AdminReviewsView />
    </div>
  );
}
