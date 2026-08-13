import postgres from "postgres";

// A direct TCP connection, for Node scripts only — the deployed server runtime has no raw sockets,
// which is why lib/db/index.ts speaks HTTP instead. Never import this from a route handler.

export type QueryParam = postgres.Serializable;
export type QueryRow = postgres.Row;

const url = process.env.SUPABASE_POSTGRES_URL;
if (!url) {
  throw new Error("SUPABASE_POSTGRES_URL is not set. Scripts load it via --env-file.");
}

export const client = postgres(url, {
  // The pooled connection runs pgbouncer in transaction mode, which has no prepared statements.
  prepare: false,
  // The typhoon tables are not in the default schema.
  connection: {
    search_path: "catfisha_typhoons, public",
  },
});

const sql = {
  query: <T extends QueryRow[] = QueryRow[]>(query: string, params: QueryParam[] = []) =>
    client.unsafe<T>(query, params),
};

export default sql;
