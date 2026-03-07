import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { JobForm } from "@/features/jobs/job-form";

export const metadata = { title: "Post a Job" };

export default async function PostJobPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "CLIENT") redirect("/dashboard");

  return <JobForm mode="create" />;
}
