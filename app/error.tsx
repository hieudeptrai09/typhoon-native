"use client";

import FrownError from "@/lib/components/FrownError";
import Footer from "@/lib/layout/Footer";
import Navbar from "@/lib/layout/NavBar";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center">
      <Navbar allNames={[]} />

      <main className="fixed inset-0">
        <FrownError onRetry={reset} />
      </main>

      <Footer />
    </div>
  );
}
