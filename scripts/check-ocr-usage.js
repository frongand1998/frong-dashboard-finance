#!/usr/bin/env node

/**
 * Script to check OCR usage for a specific user
 * Run: node scripts/check-ocr-usage.js <email>
 * Example: node scripts/check-ocr-usage.js frongand1998@gmail.com
 */

const { createClient } = require("@supabase/supabase-js");
const { clerkClient } = require("@clerk/clerk-sdk-node");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const clerkSecretKey = process.env.CLERK_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  console.error(
    "Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

if (!clerkSecretKey) {
  console.error("❌ Missing CLERK_SECRET_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DEFAULT_LIMIT = 50;

async function checkOcrUsage(email) {
  try {
    console.log(`\n🔍 Checking OCR usage for: ${email}\n`);

    // Step 1: Find user in Clerk
    console.log("🔎 Looking up user in Clerk...");

    let users;
    try {
      users = await clerkClient.users.getUserList({ emailAddress: [email] });
    } catch (clerkError) {
      console.error("❌ Clerk API Error:", clerkError.message);
      console.error("\n💡 This might be due to:");
      console.error("1. Invalid CLERK_SECRET_KEY");
      console.error("2. Network issues");
      console.error("3. Clerk API changes");
      process.exit(1);
    }

    if (!users || !users.data || users.data.length === 0) {
      console.error(`❌ User not found in Clerk: ${email}`);
      console.error("\nDebug info:");
      console.error("- Response:", JSON.stringify(users, null, 2));
      console.error("\n💡 Tips:");
      console.error("1. Check if CLERK_SECRET_KEY is correct in .env.local");
      console.error("2. Verify the user exists in Clerk Dashboard");
      console.error("3. Make sure the email address is correct");
      process.exit(1);
    }

    const user = users.data[0];
    const userId = user.id;
    console.log(
      `✅ Found user: ${user.firstName || ""} ${user.lastName || ""} (ID: ${userId})\n`,
    );

    // Step 2: Check if user has custom limit
    const { data: limitData } = await supabase
      .from("ocr_limits")
      .select("max_monthly")
      .eq("email", email.toLowerCase())
      .single();

    const userLimit = limitData?.max_monthly || DEFAULT_LIMIT;

    // Step 3: Get current month's date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Step 4: Query OCR usage
    const { data: usageData, error: usageError } = await supabase
      .from("ocr_usage")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", startOfMonth.toISOString())
      .lte("created_at", endOfMonth.toISOString())
      .order("created_at", { ascending: false });

    if (usageError) {
      console.error("❌ Error querying usage:", usageError.message);
      process.exit(1);
    }

    const scansUsed = usageData?.length || 0;
    const remaining = Math.max(0, userLimit - scansUsed);

    // Display results
    console.log("═══════════════════════════════════════════");
    console.log("📊 OCR USAGE SUMMARY");
    console.log("═══════════════════════════════════════════");
    console.log(
      `📅 Period:     ${startOfMonth.toLocaleDateString()} - ${endOfMonth.toLocaleDateString()}`,
    );
    console.log(`🔄 Resets on:  ${resetDate.toLocaleDateString()}`);
    console.log(`📈 Used:       ${scansUsed} / ${userLimit} scans`);
    console.log(`✨ Remaining:  ${remaining} scans`);
    console.log(
      `📊 Usage:      ${((scansUsed / userLimit) * 100).toFixed(1)}%`,
    );
    console.log("═══════════════════════════════════════════\n");

    // Show recent scans
    if (scansUsed > 0) {
      console.log("📋 Recent OCR Scans:");
      usageData.slice(0, 5).forEach((scan, idx) => {
        const scanDate = new Date(scan.created_at);
        console.log(`   ${idx + 1}. ${scanDate.toLocaleString()}`);
      });
      if (scansUsed > 5) {
        console.log(`   ... and ${scansUsed - 5} more\n`);
      } else {
        console.log("");
      }
    }

    // Warnings
    if (remaining === 0) {
      console.log("⚠️  WARNING: Monthly limit reached!");
      console.log(`   Resets on ${resetDate.toLocaleDateString()}\n`);
    } else if (remaining <= 5) {
      console.log(`⚠️  WARNING: Only ${remaining} scans remaining!\n`);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.status === 401) {
      console.error("\n💡 Make sure CLERK_SECRET_KEY is valid in .env.local");
    }
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error("❌ Please provide an email address");
  console.error("Usage: node scripts/check-ocr-usage.js <email>");
  console.error(
    "Example: node scripts/check-ocr-usage.js frongand1998@gmail.com",
  );
  process.exit(1);
}

checkOcrUsage(email);
