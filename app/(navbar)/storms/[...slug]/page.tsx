import { getStorms } from "@/lib/db/api/getStorms";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getDashboardDescription, getDashboardTitle } from "../_utils/metadata";
import {
  getCanonicalStormsSlugs,
  isValidStormsSlug,
  paramsToPath,
  slugToParams,
  slugToPath,
} from "../_utils/routing";
import DashboardPageContent from "../DashboardPageContent";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

export function generateStaticParams() {
  return getCanonicalStormsSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!isValidStormsSlug(slug)) {
    return {};
  }

  const dashboardParams = slugToParams(slug);
  const { view, mode, filter } = dashboardParams;

  const titleParts = getDashboardTitle(view, mode, filter);
  const title = titleParts ? `${titleParts} | Dashboard` : "Dashboard";
  const description = getDashboardDescription(view, mode, filter);

  return {
    title: title,
    description: description,
    alternates: {
      canonical: paramsToPath(dashboardParams),
    },
  };
}

const Dashboard = async ({ params }: PageProps) => {
  const { slug } = await params;

  if (!isValidStormsSlug(slug)) {
    notFound();
  }

  const dashboardParams = slugToParams(slug);
  const path = paramsToPath(dashboardParams);
  if (slugToPath(slug) !== path) {
    redirect(path);
  }

  const result = await getStorms();
  return <DashboardPageContent stormsData={result?.data ?? null} />;
};

export default Dashboard;
