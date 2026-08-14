import type { RetiredName, TyphoonName } from "@/lib/types";

export const defaultTyphoonName: TyphoonName = {
  id: 0,
  position: 0,
  name: "",
  meaning: "",
  country: "",
  language: "",
  isRetired: false,
  isReplaced: false,
  // retirementReason stays undefined: the default name is not retired.
  tag: "",
};

export const defaultRetiredName: RetiredName = {
  ...defaultTyphoonName,
  lastYear: 0,
  replacementName: "",
};
