import { rpc } from "@/lib/data/rpc";

// The fact list is built and kept current inside Postgres (db/facts.sql), so this only picks one.
export async function getRandomFact(): Promise<string | null> {
  const fact = await rpc<string | null>("get_random_fact");

  return fact ?? null;
}
