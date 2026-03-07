"use client";

import { useState, useEffect, useCallback } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { Textarea } from "@/components/ui/textarea";
import { formatRelativeTime } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface ReviewRow {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: { id: string; email: string; avatar: string | null };
  reviewee: { id: string; email: string; avatar: string | null };
  contract: { job: { id: string; title: string } };
}

export function AdminReviewsView() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteModal, setDeleteModal] = useState<ReviewRow | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      const res = await fetch(`/api/admin/reviews?${params}`);
      const json = await res.json();
      if (res.ok) {
        setReviews(json.data);
        setTotalPages(json.pagination.totalPages);
        setTotal(json.pagination.total);
      }
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  async function handleDelete() {
    if (!deleteModal || !reason.trim()) {
      toast.error("Reason is required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/reviews/${deleteModal.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE", reason: reason.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed");
      toast.success("Review deleted");
      setReviews((prev) => prev.filter((r) => r.id !== deleteModal.id));
      setDeleteModal(null);
      setReason("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-500">{total} reviews found</div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-white border border-gray-200 p-4">
              <div className="h-4 w-2/3 rounded bg-gray-200 mb-2" />
              <div className="h-3 w-1/3 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-gray-400">No reviews yet</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl bg-white border border-gray-200 p-4">
              <div className="flex items-start gap-4">
                <Avatar
                  src={review.reviewer.avatar}
                  alt={review.reviewer.email}
                  email={review.reviewer.email}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {review.reviewer.email.split("@")[0]}
                      </p>
                      <p className="text-xs text-gray-400">
                        reviewed {review.reviewee.email.split("@")[0]} •{" "}
                        {review.contract.job.title} •{" "}
                        {formatRelativeTime(review.createdAt)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 border-red-300 shrink-0"
                      onClick={() => setDeleteModal(review)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                  <StarRating value={review.rating} readonly size="sm" className="mt-1.5" />
                  {review.comment && (
                    <p className="mt-1.5 text-sm text-gray-600">{review.comment}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteModal(null)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl p-6 z-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Delete Review</h2>
            <p className="text-sm text-gray-500 mb-4">
              This review will be permanently deleted. Please provide a reason.
            </p>
            <div className="space-y-4">
              <Textarea
                label="Reason"
                placeholder="Why are you deleting this review?"
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="flex gap-3">
                <Button variant="destructive" loading={submitting} onClick={handleDelete}>
                  Delete Review
                </Button>
                <Button variant="outline" onClick={() => { setDeleteModal(null); setReason(""); }}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
