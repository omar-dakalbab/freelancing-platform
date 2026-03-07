import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use the direct (non-pooled) URL for migrations so Prisma bypasses PgBouncer.
    // Runtime queries use DATABASE_URL (pooled via PgBouncer on port 6543).
    url: process.env.DIRECT_URL,
  },
});
