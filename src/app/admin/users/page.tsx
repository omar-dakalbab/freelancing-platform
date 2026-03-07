import { AdminUsersView } from "@/features/admin/admin-users-view";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Users" };

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="mt-1 text-gray-500">Manage platform users and their access</p>
      </div>
      <AdminUsersView />
    </div>
  );
}
