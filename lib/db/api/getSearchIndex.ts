import { rpc } from "@/lib/data/rpc";
import type { RetirementReason, SearchResult } from "@/lib/types";

interface SearchRow {
  // id is bigint and stormCount is a COUNT(); both are cast to text in SQL to avoid precision loss.
  id: string | null;
  name: string;
  position: number;
  country: string;
  isRetired: boolean;
  retirementReason: RetirementReason | null;
  note: string | null;
  replacementName: string | null;
  stormCount: string;
}

export async function getSearchIndex(): Promise<SearchResult[]> {
  // An empty pattern is the "everything" case of the ILIKE `search_names` already runs.
  const rows = await rpc<SearchRow[]>("search_names", { p_query: "" });

  return rows.map((row) => ({
    id: row.id !== null ? Number(row.id) : null,
    name: row.name,
    position: row.position,
    country: row.country,
    isRetired: row.isRetired,
    retirementReason: row.retirementReason,
    note: row.note,
    replacementName: row.replacementName,
    stormCount: Number(row.stormCount),
  }));
}
