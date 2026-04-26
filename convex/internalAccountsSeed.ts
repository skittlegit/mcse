"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { createHash } from "node:crypto";

/**
 * Bulk-seed all 20 internal accounts (admin + 19 company CEOs).
 *
 * Run once after `npx convex deploy`:
 *   npx convex run internalAccountsSeed:seedAll '{"accounts":[...]}' --prod
 *
 * Idempotent: re-running skips accounts whose email already exists.
 *
 * AUTH_PEPPER must be set in Convex env (and match the value in Vercel env
 * used by the login route).
 */

function hashPassword(password: string): string {
  const pepper = process.env.AUTH_PEPPER;
  if (!pepper) throw new Error("AUTH_PEPPER not set in Convex env");
  return createHash("sha256").update(password + pepper).digest("hex");
}

export const seedAll = action({
  args: {
    accounts: v.array(
      v.object({
        email: v.string(),
        password: v.string(),
        role: v.string(),
        ticker: v.optional(v.string()),
        displayName: v.optional(v.string()),
      }),
    ),
  },
  returns: v.object({ created: v.number(), skipped: v.number() }),
  handler: async (ctx, { accounts }) => {
    let created = 0;
    let skipped = 0;
    for (const a of accounts) {
      const result = await ctx.runMutation(api.internalAccounts.upsert, {
        emailLower: a.email.toLowerCase().trim(),
        passwordHash: hashPassword(a.password),
        role: a.role,
        ticker: a.ticker,
        displayName: a.displayName,
      });
      if (result === "created") created++;
      else skipped++;
    }
    return { created, skipped };
  },
});

// Hardcoded roster of all 20 production accounts (1 admin + 19 company CEOs).
// Idempotent — re-runs skip existing emails. Safe to call from CLI any time:
//   npx convex run --prod internalAccountsSeed:seedKnownAccounts '{}'
const KNOWN_ACCOUNTS: Array<{
  email: string;
  password: string;
  role: string;
  ticker?: string;
  displayName: string;
}> = [
  { email: "admin@mcse.in", password: "Admin-MCSE-2026!Q9z3xB", role: "admin", displayName: "MCSE Admin" },
  { email: "co-enigma@mcse.in", password: "Engm-K9p2vXqM4", role: "company", ticker: "ENIGMA", displayName: "Enigma CEO" },
  { email: "co-erudite@mcse.in", password: "Erud-N3jRq8wL7", role: "company", ticker: "ERUDITE", displayName: "Erudite CEO" },
  { email: "co-marc@mcse.in", password: "Marc-T6yHb4kZ9", role: "company", ticker: "MARC", displayName: "MARC CEO" },
  { email: "co-ambrosia@mcse.in", password: "Ambr-V2nFc5dP8", role: "company", ticker: "AMBROSIA", displayName: "Ambrosia CEO" },
  { email: "co-roboverse@mcse.in", password: "Robo-X7gMt3sJ4", role: "company", ticker: "ROBOVERSE", displayName: "Roboverse CEO" },
  { email: "co-cognitia@mcse.in", password: "Cogn-W4kQz9rB2", role: "company", ticker: "COGNITIA", displayName: "Cognitia CEO" },
  { email: "co-gasmonkeys@mcse.in", password: "Gasm-Y8pVl6tN3", role: "company", ticker: "GASMONKEYS", displayName: "Gas Monkeys CEO" },
  { email: "co-lincolnlabs@mcse.in", password: "Linc-D5xCw2hF6", role: "company", ticker: "LINCOLNLABS", displayName: "Lincoln Labs CEO" },
  { email: "co-aero@mcse.in", password: "Aero-J3sBn7mK9", role: "company", ticker: "AERO", displayName: "Aero CEO" },
  { email: "co-apexpmi@mcse.in", password: "Apex-R6qDz4vT8", role: "company", ticker: "APEXPMI", displayName: "Apex PMI CEO" },
  { email: "co-acm@mcse.in", password: "Acmm-H2tLp9wX5", role: "company", ticker: "ACM", displayName: "ACM CEO" },
  { email: "co-adventure@mcse.in", password: "Advn-G7fWy3cR4", role: "company", ticker: "ADVENTURE", displayName: "Adventure CEO" },
  { email: "co-auv@mcse.in", password: "Auvv-S5nKj8bM2", role: "company", ticker: "AUV", displayName: "AUV CEO" },
  { email: "co-media@mcse.in", password: "Medi-P4hVx6qZ7", role: "company", ticker: "MEDIA", displayName: "Media CEO" },
  { email: "co-aeiforia@mcse.in", password: "Aeif-B9cTr3lY5", role: "company", ticker: "AEIFORIA", displayName: "Aeiforia CEO" },
  { email: "co-qubit@mcse.in", password: "Qubt-F8mNd5gJ2", role: "company", ticker: "QUBIT", displayName: "Qubit CEO" },
  { email: "co-mastershot@mcse.in", password: "Mast-K3pSh7vQ6", role: "company", ticker: "MASTERSHOT", displayName: "MasterShot CEO" },
  { email: "co-eic@mcse.in", password: "Eicc-L6wBz4nC8", role: "company", ticker: "EIC", displayName: "EIC CEO" },
  { email: "co-synolo@mcse.in", password: "Syno-M2dRf9tH3", role: "company", ticker: "SYNOLO", displayName: "Synolo CEO" },
];

export const seedKnownAccounts = action({
  args: {},
  returns: v.object({ created: v.number(), skipped: v.number() }),
  handler: async (ctx): Promise<{ created: number; skipped: number }> => {
    let created = 0;
    let skipped = 0;
    for (const a of KNOWN_ACCOUNTS) {
      const result: "created" | "skipped" = await ctx.runMutation(api.internalAccounts.upsert, {
        emailLower: a.email.toLowerCase().trim(),
        passwordHash: hashPassword(a.password),
        role: a.role,
        ticker: a.ticker,
        displayName: a.displayName,
      });
      if (result === "created") created++;
      else skipped++;
    }
    return { created, skipped };
  },
});

export const resetPassword = action({
  args: { email: v.string(), newPassword: v.string() },
  returns: v.union(v.literal("ok"), v.literal("not_found")),
  handler: async (ctx, { email, newPassword }): Promise<"ok" | "not_found"> => {
    const result = await ctx.runMutation(api.internalAccounts.updatePasswordHash, {
      emailLower: email.toLowerCase().trim(),
      passwordHash: hashPassword(newPassword),
    });
    return result;
  },
});
