import type { NamesSlugParams } from "./routing";

export const getNamesTitle = (params: NamesSlugParams): string => {
  if (params.view === "retired") return "Retired Typhoon Names";
  if (params.showHistory) return "Typhoon Name History";
  return "Current Typhoon Names";
};

export const getNamesDescription = (params: NamesSlugParams): string => {
  if (params.view === "retired") {
    return "Browse retired typhoon names that have been permanently removed from the Western Pacific naming rotation due to the severity of their associated storms.";
  }
  if (params.view === "list") {
    return "View all typhoon names in list format with detailed information including country of origin, language, and naming history.";
  }

  if (params.showHistory) {
    return params.showName
      ? "Explore all typhoon names organized by position with name labels and full naming history visible in the grid."
      : "Explore all typhoon names organized by position with naming history visible in the grid.";
  }
  return params.showName
    ? "Explore all typhoon names organized by position with name labels visible in the grid."
    : "Explore all typhoon names organized by position in the Western Pacific naming sequence. View name origins, countries, and storm history.";
};
