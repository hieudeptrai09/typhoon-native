export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const getZoomEarthUrl = (name: string, year: number): string =>
  `https://zoom.earth/storms/${name.trim().toLowerCase().replace(/\s+/g, "-")}-${year}/`;
