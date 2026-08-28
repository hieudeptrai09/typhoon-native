import type { RetirementReason } from "@/lib/types";

export const RETIRED_REASON_LABEL: Record<RetirementReason, string> = {
  destructive: "Destructive Storm",
  language: "Language Problem",
  misspell: "Misspelling",
  special: "Special Storm",
};
