import { capitalize } from "@/lib/utils/format";
import { normalizeParam } from "@/lib/utils/params";

export const getDashboardTitle = (
  view: string | string[] | undefined,
  mode: string | string[] | undefined,
  filter: string | string[] | undefined,
): string => {
  const viewStr = normalizeParam(view) || "all";
  const filterStr = normalizeParam(filter);

  const viewTitles: Record<string, string> = {
    all: filterStr === "position" ? "All Storms by Position" : "All Storms by Name",
    highlights: `${capitalize(filterStr)} Typhoons by Position`,
    average: `Average Intensity by ${capitalize(filterStr)}`,
    recurrence: `Average Storm Recurrence by ${capitalize(filterStr)}`,
    avgdate: `Average Storm Dates by ${capitalize(filterStr)}`,
  };

  return viewTitles[viewStr] ?? viewTitles.all;
};

export const getDashboardDescription = (
  view: string | string[] | undefined,
  mode: string | string[] | undefined,
  filter: string | string[] | undefined,
): string => {
  const viewStr = normalizeParam(view) || "all";
  const modeStr = normalizeParam(mode) || "table";
  const filterStr = normalizeParam(filter);

  if (viewStr === "all") {
    if (modeStr === "list") {
      return "Browse all typhoon names used in the Western Pacific basin. Click any name to see detailed storm history, including years, intensities, and track maps.";
    }
    return "View comprehensive typhoon storm data organized by position in the naming list. Track all typhoons that have occurred in the Western Pacific basin.";
  }

  if (viewStr === "highlights") {
    const highlightDescriptions: Record<string, string> = {
      strongest:
        "Explore the strongest typhoons by position - discover which names have been associated with the most powerful storms in history.",
      first:
        "View the first typhoons of each season by position - track the earliest storms to receive each name in the typhoon naming sequence.",
      last: "Browse the last typhoons of each season by position - see which storms closed out their respective seasons for each name position.",
      untracked:
        "Discover typhoons not tracked by the JTWC, organized by position - storms that were named but fell outside the Joint Typhoon Warning Center's official monitoring.",
    };
    return (
      highlightDescriptions[filterStr] ||
      "Discover highlighted typhoons with special characteristics organized by their position in the naming sequence."
    );
  }

  if (viewStr === "average") {
    const averageDescriptions: Record<string, string> = {
      position:
        "Analyze average typhoon intensity by position in the naming list. Compare which positions tend to produce stronger or weaker storms.",
      name: "Compare average intensity across different typhoon names. Discover which names have historically been associated with stronger storms.",
      country:
        "View average typhoon intensity statistics by contributing country. See how different countries' name contributions perform.",
      year: "Track average typhoon intensity trends by year. Analyze how storm strength has evolved over time in the Western Pacific.",
      month:
        "Explore typhoon activity patterns throughout the year. See how many storms form each month and compare their average intensities across the season.",
    };
    return (
      averageDescriptions[filterStr] ||
      "Statistical analysis of typhoon intensity data with comprehensive averaging and comparison tools."
    );
  }

  if (viewStr === "recurrence") {
    const recurrenceDescriptions: Record<string, string> = {
      position:
        "View the average number of years between consecutive storms at each naming position. Identify which slots see more or less frequent activity.",
      name: "Explore how often storms sharing the same typhoon name recur, in years. See how often each name is recycled in the naming cycle.",
    };
    return (
      recurrenceDescriptions[filterStr] ||
      "Analyze the temporal spacing between storms grouped by position or name."
    );
  }

  if (viewStr === "avgdate") {
    const avgDateDescriptions: Record<string, string> = {
      position:
        "See the average start and end dates of storms at each naming position. Discover which slots tend to be active earlier or later in the typhoon season.",
      name: "Explore the average start and end dates of storms sharing the same typhoon name. Compare when each name typically becomes active during the year.",
    };
    return (
      avgDateDescriptions[filterStr] ||
      "Analyze the average seasonal start and end dates of storms grouped by position or name."
    );
  }

  return "Comprehensive typhoon storm database with advanced filtering, analysis, and visualization tools for Western Pacific typhoons.";
};
