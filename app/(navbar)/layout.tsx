import { getNameList } from "@/lib/db/api/getNameList";
import Footer from "@/lib/layout/Footer";
import Navbar from "@/lib/layout/NavBar";
import type { ReactNode } from "react";

interface WithNavbarLayoutProps {
  children: ReactNode;
}

export default async function WithNavbarLayout({ children }: WithNavbarLayoutProps) {
  // Search is a nav aid on every page: a database hiccup should empty it, not break the layout.
  const allNames = await getNameList()
    .then((res) => res.data)
    .catch(() => []);

  return (
    <div className="flex min-h-screen flex-col bg-stone-100">
      <Navbar allNames={allNames} />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
