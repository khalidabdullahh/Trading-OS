const fs = require("fs");
const { Client } = require("pg");

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl && fs.existsSync(".env.local")) {
  const lines = fs.readFileSync(".env.local", "utf8").split("\n");
  for (const line of lines) {
    if (line.trim().startsWith("DATABASE_URL=")) {
      dbUrl = line.trim().split("=").slice(1).join("=").trim().replace(/^["']|["']$/g, "");
      break;
    }
  }
}

if (!dbUrl) {
  console.error("❌ DATABASE_URL not found in environment or .env.local");
  process.exit(1);
}

const client = new Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(async () => {
    console.log("✅ [SUCCESS] Successfully connected to Neon PostgreSQL Database!");
    const res = await client.query("SELECT version();");
    console.log("PostgreSQL Version:", res.rows[0].version.split(",")[0]);
    await client.end();
  })
  .catch(err => {
    console.error("❌ Connection failed:", err.message);
    process.exit(1);
  });
