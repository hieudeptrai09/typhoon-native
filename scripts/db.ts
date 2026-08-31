import postgres from "postgres";

// A direct TCP connection, for Node scripts only. The app has no raw sockets, which is why it
// reaches the same data over HTTP through lib/data/rpc.ts. Never import this from lib/ or app/.

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
