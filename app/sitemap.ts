import {
  getCanonicalNamesSlugs,
  slugToPath as namesSlugToPath,
} from "@/app/(navbar)/names/_utils/routing";
import {
  getCanonicalStormsSlugs,
  paramsToPath,
  slugToParams,
} from "@/app/(navbar)/storms/_utils/routing";
import { getNameList } from "@/lib/db/api/getNameList";
import { getPositionSlug } from "@/lib/utils/position";
import type { MetadataRoute } from "next";

const BASE_URL = "https://typhoons.vercel.app";

const pathDepth = (path: string): number => path.split("/").filter(Boolean).length;
const priorityForPath = (path: string): number => (10 - pathDepth(path)) / 10;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const nameList = await getNameList();

  const stormsPages: MetadataRoute.Sitemap = getCanonicalStormsSlugs().map((slug) => {
    const path = paramsToPath(slugToParams(slug));
    return {
      url: `${BASE_URL}${path}`,
      lastModified: new Date("2026-07-19"),
      changeFrequency: "monthly",
      priority: priorityForPath(path),
    };
  });

  const namesPages: MetadataRoute.Sitemap = getCanonicalNamesSlugs().map((slug) => {
    const path = namesSlugToPath(slug);
    return {
      url: `${BASE_URL}${path}`,
      lastModified: new Date("2026-06-24"),
      changeFrequency: "monthly",
      priority: priorityForPath(path),
    };
  });

  const infoPages: MetadataRoute.Sitemap = (nameList?.data ?? []).map((name) => {
    const path = `/info/${name.toLowerCase()}/`;
    return {
      url: `${BASE_URL}${path}`,
      lastModified: new Date("2026-07-19"),
      changeFrequency: "monthly",
      priority: priorityForPath(path),
    };
  });

  const positionPages: MetadataRoute.Sitemap = Array.from({ length: 143 }, (_, i) => {
    const path = `/positions/${getPositionSlug(i + 1)}/`;
    return {
      url: `${BASE_URL}${path}`,
      lastModified: new Date("2026-07-19"),
      changeFrequency: "monthly",
      priority: 0.7,
    };
  });

  return [
    {
      url: BASE_URL,
      lastModified: new Date("2026-07-19"),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...stormsPages,
    ...namesPages,
    ...infoPages,
    ...positionPages,
  ];
}
