import { AdminContractsView } from "@/features/admin/admin-contracts-view";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contracts" };

export default function AdminContractsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
        <p className="mt-1 text-gray-500">Monitor all platform contracts</p>
      </div>
      <AdminContractsView />
    </div>
  );
}
