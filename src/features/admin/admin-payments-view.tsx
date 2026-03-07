"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { DollarSign, TrendingUp } from "lucide-react";

interface PaymentRow {
  id: string;
  amount: number;
  platformFee: number;
  status: string;
  createdAt: string;
  contract: {
    job: { id: string; title: string };
    clientProfile: { user: { email: string }; companyName: string | null };
    freelancerProfile: { user: { email: string }; title: string | null };
  };
}

const statusVariant: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  PENDING: "warning",
  COMPLETED: "success",
  FAILED: "destructive",
  REFUNDED: "secondary",
};

export function AdminPaymentsView() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [totals, setTotals] = useState({ completedVolume: 0, completedFees: 0 });

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/payments?${params}`);
      const json = await res.json();
      if (res.ok) {
        setPayments(json.data);
        setTotalPages(json.pagination.totalPages);
        setTotal(json.pagination.total);
        setTotals(json.totals);
      }
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);
  useEffect(() => { setPage(1); }, [statusFilter]);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-50">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.completedVolume)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-brand-50">
                <TrendingUp className="h-5 w-5 text-brand-800" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Platform Fees Earned</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.completedFees)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      <div className="text-sm text-gray-500">{total} payments found</div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-white border border-gray-200 p-4">
              <div className="h-4 w-2/3 rounded bg-gray-200 mb-2" />
              <div className="h-3 w-1/3 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : payments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-gray-400">
            No payments found
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-start gap-4 rounded-xl bg-white border border-gray-200 p-4"
            >
              <div className={`p-2 rounded-lg shrink-0 ${payment.status === "COMPLETED" ? "bg-green-100" : payment.status === "FAILED" ? "bg-red-100" : "bg-amber-100"}`}>
                <DollarSign className={`h-4 w-4 ${payment.status === "COMPLETED" ? "text-green-600" : payment.status === "FAILED" ? "text-red-600" : "text-amber-600"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
                  <Badge variant={statusVariant[payment.status] ?? "secondary"}>
                    {payment.status}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Fee: {formatCurrency(payment.platformFee)} •{" "}
                  {payment.contract.job.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {payment.contract.clientProfile.companyName || payment.contract.clientProfile.user.email.split("@")[0]}{" "}
                  → {payment.contract.freelancerProfile.title || payment.contract.freelancerProfile.user.email.split("@")[0]} •{" "}
                  {formatRelativeTime(payment.createdAt)}
                </p>
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
    </div>
  );
}
