import { client } from "@/scripts/db";

// The file holds DROP TABLE through the final fill, so one transaction means a failure anywhere
// leaves the old facts table in place. The path is relative to the project root, where npm runs.
async function main(): Promise<void> {
  console.log("Rebuilding the facts table…");
  await client.begin((tx) => tx.file("db/facts.sql"));

  const [{ count }] = await client<{ count: string }[]>`
    SELECT COUNT(*)::text AS count FROM catfisha_typhoons.facts
  `;
  console.log(`Stored ${count} facts. Triggers now keep them current.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.end());
