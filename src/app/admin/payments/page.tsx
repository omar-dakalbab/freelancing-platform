import { AdminPaymentsView } from "@/features/admin/admin-payments-view";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Payments" };

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="mt-1 text-gray-500">Monitor all platform payments and revenue</p>
      </div>
      <AdminPaymentsView />
    </div>
  );
}
