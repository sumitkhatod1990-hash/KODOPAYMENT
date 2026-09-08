#!/usr/bin/env node
import "dotenv/config";
import { bootstrapAdminUser, ensureAdminStore, persistenceMode } from "./neonStore.js";

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--email" && argv[i + 1]) {
      args.email = argv[++i];
    } else if (arg === "--password" && argv[i + 1]) {
      args.password = argv[++i];
    } else if (arg === "--name" && argv[i + 1]) {
      args.name = argv[++i];
    } else if (arg === "--role" && argv[i + 1]) {
      args.role = argv[++i];
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const email = (args.email || process.env.BOOTSTRAP_ADMIN_EMAIL || "").trim();
  const password = args.password || process.env.BOOTSTRAP_ADMIN_PASSWORD || "";
  const name = (args.name || process.env.BOOTSTRAP_ADMIN_NAME || "Platform Administrator").trim();
  const role = (args.role || process.env.BOOTSTRAP_ADMIN_ROLE || "super_admin").trim();

  if (!email) {
    console.error("[Bootstrap Error] Explicit admin email is required.");
    console.error("Usage: node server/bootstrapAdmin.js --email <email> --password <password> [--name <name>] [--role <role>]");
    console.error("   or: BOOTSTRAP_ADMIN_EMAIL=... BOOTSTRAP_ADMIN_PASSWORD=... node server/bootstrapAdmin.js");
    process.exit(1);
  }

  if (!password || password.length < 12) {
    console.error("[Bootstrap Error] Explicit admin password of at least 12 characters is required.");
    process.exit(1);
  }

  const validRoles = ["super_admin", "compliance_officer", "support_agent", "read_only"];
  if (!validRoles.includes(role)) {
    console.error(`[Bootstrap Error] Invalid role "${role}". Must be one of: ${validRoles.join(", ")}`);
    process.exit(1);
  }

  try {
    await ensureAdminStore();
    const admin = await bootstrapAdminUser({ email, password, name, role });
    console.log("[Bootstrap Success] Admin user created successfully:");
    console.log(`  ID:     ${admin.id}`);
    console.log(`  Email:  ${admin.email}`);
    console.log(`  Name:   ${admin.name}`);
    console.log(`  Role:   ${admin.role}`);
    console.log(`  Status: ${admin.status}`);
    console.log(`  Store:  ${persistenceMode()}`);
    // Explicit security rule: Password is NEVER printed or echoed
    process.exit(0);
  } catch (error) {
    console.error(`[Bootstrap Failed] ${error.message}`);
    process.exit(1);
  }
}

main();
