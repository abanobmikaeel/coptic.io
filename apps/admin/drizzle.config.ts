import type { Config } from "drizzle-kit";

export default {
	schema: "./lib/db/schema.ts",
	out: "./lib/db/migrations",
	dialect: "sqlite",
	dbCredentials: {
		url: process.env.DB_PATH ?? "coptic-admin.db",
	},
} satisfies Config;
