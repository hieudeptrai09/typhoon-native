"use client";

import FrownError from "@/lib/components/FrownError";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center">
      <FrownError onRetry={reset} />
    </div>
  );
}
