import { INTENSITY_LABEL } from "@/lib/constants";
import { capitalize } from "@/lib/utils/format";
import { intensityFromSlug } from "@/lib/utils/intensity";
import { normalizeParam } from "@/lib/utils/params";

// Every intensity label pluralizes with a plain "s": "Category 5 Super Typhoons", "Monsoon Depressions".
const intensityTitle = (filter: string): string => {
  const intensity = intensityFromSlug(filter);
  return intensity ? `${INTENSITY_LABEL[intensity]}s by Position` : "Storms by Intensity";
};

// Hand-written per intensity: nine pages off one template would read as the same page nine times.
const INTENSITY_DESCRIPTIONS: Record<string, string> = {
  md: "Browse the named monsoon depressions of the Western Pacific - systems that grew out of the monsoon trough rather than as classic tropical cyclones - and the naming positions they landed on.",
  td: "See the storms that never grew past tropical depression strength before dissipating, and which naming positions have collected the most of them.",
  ts: "Browse the storms that peaked as tropical storms, the most common fate of a Western Pacific name, mapped across the whole naming list.",
  sts: "Find the storms that stalled at severe tropical storm strength, one step short of becoming a typhoon, and where they sit in the naming sequence.",
  cat1: "Browse the storms that peaked at Category 1 typhoon strength, the entry rung of the typhoon scale, by naming position and season.",
  cat2: "See every storm that topped out as a Category 2 typhoon, with the year, month, and naming position of each.",
  cat3: "Browse the Category 3 typhoons of the Western Pacific - the first rung of major typhoon strength - grouped by their position in the naming list.",
  cat4: "Find the storms that reached Category 4 typhoon strength, and see which names and positions recur among the basin's most violent systems.",
  cat5: "Browse every Category 5 super typhoon in the record - the strongest storms the Western Pacific has produced - and the names they carried.",
};

// The calendar pages are one date apart, not one grouping apart, so their titles name the
// question each asks rather than capitalizing the filter.
const CALENDAR_TITLES: Record<string, string> = {
  started: "Seasons by Storm Start Date",
  ended: "Seasons by Storm End Date",
  active: "Seasons by Active Storm Date",
  todate: "Season Pace by Date",
};

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
    intensity: intensityTitle(filterStr),
    average: `Average Intensity by ${capitalize(filterStr)}`,
    recurrence: `Average Storm Recurrence by ${capitalize(filterStr)}`,
    avgdate: `Average Storm Dates by ${capitalize(filterStr)}`,
    calendar: CALENDAR_TITLES[filterStr] ?? "Storms by Calendar Date",
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
    };
    return (
      highlightDescriptions[filterStr] ||
      "Discover highlighted typhoons with special characteristics organized by their position in the naming sequence."
    );
  }

  if (viewStr === "intensity") {
    return (
      INTENSITY_DESCRIPTIONS[filterStr] ||
      "Browse Western Pacific storms by the intensity they peaked at, from monsoon depressions up to Category 5 super typhoons."
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
      country:
        "Compare the average seasonal start and end dates of storms named by each contributing country. See whose names tend to be used earlier or later in the season.",
      year: "Track the average start and end dates of each typhoon season. See which years ran early, late, or longer than usual in the Western Pacific.",
    };
    return (
      avgDateDescriptions[filterStr] ||
      "Analyze the average seasonal start and end dates of storms grouped by position, name, country, or year."
    );
  }

  if (viewStr === "calendar") {
    const calendarDescriptions: Record<string, string> = {
      started:
        "Pick any day of the year and see which seasons had a Western Pacific storm form on it, then open a season to read off the storms themselves.",
      ended:
        "Pick any day of the year and see which seasons had a Western Pacific storm dissipate on it, season by season across the whole record.",
      active:
        "Pick any day of the year and see which seasons still had a storm out over the Western Pacific on it, and how far into each storm the day fell.",
      todate:
        "Pick any day of the year and compare how many storms each Western Pacific season had already produced by that point, against the average pace and month by month.",
    };
    return (
      calendarDescriptions[filterStr] ||
      "Pick a day of the year and see the Western Pacific storms that touched it, season by season."
    );
  }

  return "Comprehensive typhoon storm database with advanced filtering, analysis, and visualization tools for Western Pacific typhoons.";
};
