import rpc, { type ApiListResponse } from "@/be";
import { cached } from "@/be/cache";
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

async function querySearch(query: string): Promise<ApiListResponse<SearchResult[]>> {
  const rows = await rpc.call<SearchRow[]>("search_names", { p_query: query });

  const data: SearchResult[] = rows.map((row) => ({
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

  return { data, count: data.length };
}

export const search = cached(querySearch, ["search"], { revalidate: 3600 });
