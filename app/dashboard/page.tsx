import { redirect } from "next/navigation";
import McpFlow from "@/components/dashboard/mcp-flow";

import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div>
      <McpFlow />
    </div>
  );
}
