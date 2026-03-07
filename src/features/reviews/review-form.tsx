"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/ui/star-rating";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReviewFormProps {
  contractId: string;
  freelancerName: string;
  onSuccess: () => void;
}

export function ReviewForm({ contractId, freelancerName, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId, rating, comment: comment.trim() || undefined }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to submit review");

      toast.success("Review submitted successfully!");
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
          Leave a Review for {freelancerName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Rating</p>
            <StarRating value={rating} onChange={setRating} size="lg" />
            {rating > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
              </p>
            )}
          </div>

          <Textarea
            label="Review (optional)"
            placeholder={`Share your experience working with ${freelancerName}...`}
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            hint={`${comment.length}/2000 characters`}
          />

          <Button type="submit" loading={submitting} disabled={rating === 0}>
            Submit Review
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
