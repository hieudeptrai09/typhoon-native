import postgres from "postgres";

export type QueryParam = postgres.Serializable;
export type QueryRow = postgres.Row;

export interface ApiResponse<T> {
  data: T;
}

export interface ApiListResponse<T> extends ApiResponse<T> {
  count: number;
}

const client = postgres(process.env.SUPABASE_POSTGRES_URL!, {
  // Supabase's pooled connection (pgbouncer, transaction mode) doesn't support prepared statements, so they must be disabled here.
  prepare: false,
  // The typhoon tables live in the catfisha_typhoons schema, not public.
  connection: {
    search_path: "catfisha_typhoons, public",
  },
});

const sql = {
  query: <T extends QueryRow[] = QueryRow[]>(query: string, params: QueryParam[] = []) =>
    client.unsafe<T>(query, params),
};

export default sql;
