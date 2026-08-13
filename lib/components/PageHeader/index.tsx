import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  children: ReactNode;
}

const PageHeader = ({ title, children }: PageHeaderProps) => {
  return (
    <div className="px-4 py-8 md:p-8">
      <h1 className="mb-6 text-center text-3xl font-bold text-foreground">{title}</h1>
      {children}
    </div>
  );
};

export default PageHeader;
