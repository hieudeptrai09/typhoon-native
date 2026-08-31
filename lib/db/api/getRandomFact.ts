import { rpc } from "@/lib/data/rpc";

// The 51 queries that build the fact list cannot run here — the app reaches Postgres only through
// the functions in db/functions.sql. scripts/generate-facts.ts builds the list out of band and
// stores it; re-run it whenever the storm data changes.
export async function getRandomFact(): Promise<string | null> {
  const fact = await rpc<string | null>("get_random_fact");

  return fact ?? null;
}
