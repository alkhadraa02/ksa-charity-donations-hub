import { execSync } from "node:child_process";

// Creates a fresh SQLite test database (prisma/test.db, gitignored) before the suite.
export default function setup() {
  execSync("npx prisma db push --skip-generate --force-reset --accept-data-loss", {
    stdio: "pipe",
    env: { ...process.env, DATABASE_URL: "file:./test.db" },
  });
}
