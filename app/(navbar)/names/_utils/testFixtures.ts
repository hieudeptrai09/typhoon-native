import type { NamesSlugParams } from "./routing";

// The seven slugs the route serves, with the params each one resolves to.
export const SERVED_SLUGS: [string, string[], NamesSlugParams][] = [
  ["/names/retired/", ["retired"], { view: "retired" }],
  ["/names/current/", ["current"], { view: "grid", showName: true, showHistory: false }],
  [
    "/names/current/tag/",
    ["current", "tag"],
    { view: "grid", showName: false, showHistory: false },
  ],
  ["/names/current/list/", ["current", "list"], { view: "list", showHistory: false }],
  ["/names/history/", ["history"], { view: "grid", showName: true, showHistory: true }],
  ["/names/history/tag/", ["history", "tag"], { view: "grid", showName: false, showHistory: true }],
  ["/names/history/list/", ["history", "list"], { view: "list", showHistory: true }],
];
