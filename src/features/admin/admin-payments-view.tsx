"use client";

import { Card, CardContent } from "@/components/ui/card";

export function AdminPaymentsView() {
  return (
    <Card>
      <CardContent className="py-12 text-center text-muted-foreground">
        Payments are disabled. The platform operates as a connection service.
      </CardContent>
    </Card>
  );
}
