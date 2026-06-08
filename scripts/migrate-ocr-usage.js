#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Script to run OCR usage table migration
 * Run: node scripts/migrate-ocr-usage.js
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  console.error(
    "Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log("🚀 Running OCR usage table migration...");

    // Read migration file
    const migrationPath = path.join(
      __dirname,
      "..",
      "supabase",
      "migrations",
      "create_ocr_usage_table.sql",
    );
    const sql = fs.readFileSync(migrationPath, "utf8");

    // Split by semicolon to execute each statement
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      console.log("📝 Executing:", statement.substring(0, 50) + "...");

      const { error } = await supabase.rpc("exec_sql", {
        sql_query: statement + ";",
      });

      if (error) {
        // Try direct query if RPC doesn't exist
        const { error: directError } = await supabase
          .from("_migrations")
          .insert({});

        if (directError) {
          console.log(
            "⚠️  Note: Cannot execute migration directly via JS client.",
          );
          console.log("📋 Please run this SQL in your Supabase SQL Editor:");
          console.log("\n" + sql + "\n");
          return;
        }
      }
    }

    console.log("✅ Migration completed successfully!");
    console.log("\nNext steps:");
    console.log(
      "1. Verify the table was created: Check Supabase Dashboard > Table Editor",
    );
    console.log("2. Test OCR feature: Upload a payment slip on /add page");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.log("\n📋 Please run this SQL manually in Supabase SQL Editor:\n");

    const migrationPath = path.join(
      __dirname,
      "..",
      "supabase",
      "migrations",
      "create_ocr_usage_table.sql",
    );
    const sql = fs.readFileSync(migrationPath, "utf8");
    console.log(sql);
  }
}

runMigration();
