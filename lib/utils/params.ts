export const DELIMITER = "|";

export const toArr = (val: string) => (val ? val.split(DELIMITER).filter(Boolean) : []);

export const toStr = (val: string[] | undefined) => (val ?? []).join(DELIMITER);
