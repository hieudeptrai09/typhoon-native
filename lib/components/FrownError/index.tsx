import { Empty } from "antd";
import { Frown, RotateCw } from "lucide-react";

/* Solid gray-600 fill rather than an Ant Button: Ant lightens a solid button on
   hover, which walks the label back toward the fill. */
const RETRY_CLASS =
  "flex items-center gap-2 rounded-full border border-gray-600 bg-gray-600 px-8 py-1.5 text-base font-semibold text-white transition-colors hover:border-gray-700 hover:bg-gray-700";

const FrownError = ({
  description = "Something went wrong. Please try again later.",
  onRetry,
}: {
  description?: string;
  onRetry?: () => void;
} = {}) => {
  return (
    <div className="mx-auto max-w-4xl p-8">
      <Empty
        image={<Frown size={64} strokeWidth={1.5} className="text-gray-400" />}
        imageStyle={{ height: 64, display: "flex", justifyContent: "center" }}
        description={<span className="text-foreground">{description}</span>}
      >
        {onRetry && (
          // Retry is the only action here on purpose: the navbar already carries
          // the escape routes, so repeating them would just compete with it.
          <button type="button" onClick={onRetry} className={`${RETRY_CLASS} mx-auto`}>
            <RotateCw className="h-4 w-4" aria-hidden />
            Try again
          </button>
        )}
      </Empty>
    </div>
  );
};

export default FrownError;
