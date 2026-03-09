"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TimeAgo } from "@/components/ui/time-ago";
import { ExternalLink } from "lucide-react";

interface ContractRow {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  job: { id: string; title: string };
  clientProfile: { user: { email: string }; companyName: string | null };
  freelancerProfile: { user: { email: string }; title: string | null };
  payments: Array<{ status: string; amount: number }>;
}

const statusVariant: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  PENDING: "warning",
  ACTIVE: "default",
  SUBMITTED: "secondary",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

export function AdminContractsView() {
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/contracts?${params}`);
      const json = await res.json();
      if (res.ok) {
        setContracts(json.data);
        setTotalPages(json.pagination.totalPages);
        setTotal(json.pagination.total);
      }
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);
  useEffect(() => { setPage(1); }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-600"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ACTIVE">Active</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="text-sm text-gray-500">{total} contracts found</div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-white border border-gray-200 p-4">
              <div className="h-4 w-2/3 rounded bg-gray-200 mb-2" />
              <div className="h-3 w-1/3 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : contracts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-gray-400">
            No contracts found
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className="flex items-start gap-4 rounded-xl bg-white border border-gray-200 p-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-900 truncate">{contract.job.title}</p>
                  <Badge variant={statusVariant[contract.status] ?? "secondary"}>
                    {contract.status}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatCurrency(contract.amount)} •{" "}
                  Client: {contract.clientProfile.companyName || contract.clientProfile.user.email.split("@")[0]} •{" "}
                  Freelancer: {contract.freelancerProfile.title || contract.freelancerProfile.user.email.split("@")[0]}
                </p>
                <TimeAgo date={contract.createdAt} className="text-xs text-gray-400 mt-0.5" />
              </div>
              <Link href={`/dashboard/contracts/${contract.id}`} target="_blank">
                <Button variant="ghost" size="icon-sm">
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </Link>
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
