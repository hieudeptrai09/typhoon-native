export const normalizeParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0] || "";
  return param || "";
};

// Multi-select filters ride in the query string as a single delimited value.
export const DELIMITER = "|";

export const toArr = (val: string) => (val ? val.split(DELIMITER).filter(Boolean) : []);

export const toStr = (val: string[] | undefined) => (val ?? []).join(DELIMITER);
