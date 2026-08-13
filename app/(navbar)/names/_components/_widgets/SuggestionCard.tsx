import ImageCredit from "@/lib/components/ImageCredit";
import ImageWithLoader from "@/lib/components/ImageWithLoader";
import type { Suggestion } from "@/lib/types";

interface SuggestionCardProps {
  suggestion: Suggestion;
}

const SuggestionCard = ({ suggestion }: SuggestionCardProps) => {
  const cardClasses = Boolean(suggestion.isChosen)
    ? "bg-blue-100 border-2 border-blue-500"
    : "bg-gray-100 border-2 border-gray-200";

  return (
    <div className={`rounded-lg p-4 ${cardClasses} w-full md:w-[400px]`}>
      <div className="mb-4 flex items-center gap-x-2 font-semibold text-foreground">
        <span
          aria-describedby={
            Boolean(suggestion.isChosen) ? `approved-desc-${suggestion.replacementName}` : undefined
          }
        >
          {suggestion.replacementName}
        </span>
        {Boolean(suggestion.isChosen) && (
          <span
            id={`approved-desc-${suggestion.replacementName}`}
            className="rounded bg-blue-500 px-2 py-1 text-xs text-white"
            aria-label="Approved as official replacement"
          >
            APPROVED
          </span>
        )}
      </div>

      <div className="flex items-start gap-4 md:gap-6">
        <div
          id={`meaning-${suggestion.replacementName}`}
          className="flex-1 text-sm text-foreground"
        >
          {suggestion.replacementMeaning}
        </div>

        {suggestion.image && (
          <div className="w-32 shrink-0 md:w-36">
            <div
              className="relative rounded-lg border border-gray-200 bg-gray-200"
              style={{ aspectRatio: "4/3" }}
            >
              <ImageWithLoader
                src={suggestion.image}
                alt={suggestion.replacementName}
                fill
                className="object-contain shadow-sm"
                unoptimized
              />
            </div>
          </div>
        )}
      </div>
      {suggestion.image && <ImageCredit credit={suggestion.imageCredit} align="end" />}
    </div>
  );
};

export default SuggestionCard;
