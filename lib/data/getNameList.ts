import { rpc } from "@/lib/data/rpc";

export async function getNameList(): Promise<string[]> {
  const rows = await rpc<{ name: string }[]>("get_name_list");

  return rows.map((row) => row.name);
}
