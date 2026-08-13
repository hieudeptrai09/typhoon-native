import { type ReactNode } from "react";

export interface Tab<T extends string = string> {
  key: T;
  label: string;
  content: ReactNode;
}

interface TabsProps<T extends string = string> {
  tabs: Tab<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  ariaLabel?: string;
  idPrefix?: string;
}

const Tabs = <T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  ariaLabel = "Tabs",
  idPrefix = "tabpanel",
}: TabsProps<T>) => {
  const getTabClasses = (tab: T) => {
    const isActive = activeTab === tab;
    return `flex-1 px-4 pb-3 font-semibold transition-colors text-sm ${
      isActive ? "border-b-2 border-sky-700 text-sky-700" : "text-foreground hover:text-highlight"
    }`;
  };

  return (
    <div className="flex flex-col">
      <div className="mb-6 flex border-b border-gray-200" role="tablist" aria-label={ariaLabel}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={`${idPrefix}-${tab.key}`}
            aria-label={tab.label}
            className={getTabClasses(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <div
              key={tab.key}
              id={`${idPrefix}-${tab.key}`}
              role="tabpanel"
              aria-hidden={!isActive}
              className="col-start-1 row-start-1"
              style={{
                visibility: isActive ? "visible" : "hidden",
                pointerEvents: isActive ? "auto" : "none",
              }}
            >
              {tab.content}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;
