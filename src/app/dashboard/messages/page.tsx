import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MessagesLayout } from "@/features/messaging/messages-layout";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <MessagesLayout session={session} />;
}
