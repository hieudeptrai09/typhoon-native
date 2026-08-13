"use client";

import HighlightedName from "@/lib/components/HighlightedName";
import { topSuggestions } from "@/lib/utils/fuzzy";
import { AutoComplete, Input, type AutoCompleteProps } from "antd";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import styles from "./SearchBar.module.css";

export type SearchBarVariant = "home" | "navbar";

const PLACEHOLDER = "Search typhoon names...";
const MAX_SUGGESTIONS = 5;

const VARIANT_CONFIG: Record<
  SearchBarVariant,
  {
    size?: "large";
    prefixClassName: string;
    prefixSize: number;
    inputClassName: string;
  }
> = {
  home: {
    size: "large",
    prefixClassName: "text-gray-500",
    prefixSize: 18,
    inputClassName: styles.homeInput,
  },
  navbar: {
    prefixClassName: "text-white",
    prefixSize: 16,
    inputClassName: `${styles.navbarInput} w-full`,
  },
};

interface SearchBarProps {
  variant: SearchBarVariant;
  allNames: string[];
}

const SearchBar = ({ variant, allNames }: SearchBarProps) => {
  const config = VARIANT_CONFIG[variant];
  const statusId = `${variant}-search-status`;

  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const trimmed = query.trim();
  const filtered = trimmed
    ? allNames.filter((name) => name.toLowerCase().includes(trimmed.toLowerCase()))
    : [];

  const suggestions = useMemo(
    () =>
      trimmed && filtered.length === 0
        ? topSuggestions(trimmed, allNames, { limit: MAX_SUGGESTIONS })
        : [],
    [trimmed, filtered.length, allNames],
  );

  const toOption = (name: string) => ({
    value: name,
    label: (
      <span className="text-sm text-foreground">
        <HighlightedName name={name} query={trimmed} />
      </span>
    ),
  });

  const options: AutoCompleteProps["options"] =
    filtered.length > 0
      ? filtered.slice(0, MAX_SUGGESTIONS).map(toOption)
      : suggestions.length > 0
        ? [{ label: "Did you mean?", options: suggestions.map(toOption) }]
        : [];

  const goToInfo = (name: string) => {
    setFocused(false);
    setQuery("");
    router.push(`/info/${encodeURIComponent(name.toLowerCase())}/`);
  };

  const handleViewAll = () => {
    setFocused(false);
    setQuery("");
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && trimmed) {
      e.preventDefault();
      handleViewAll();
    }
  };

  return (
    <AutoComplete
      value={query}
      onChange={setQuery}
      onSelect={goToInfo}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      open={focused && Boolean(trimmed)}
      filterOption={false}
      options={options}
      variant="borderless"
      rootClassName={styles.acRoot}
      style={{ width: "100%" }}
      notFoundContent={
        <div id={statusId} className="px-1 py-2 text-sm text-foreground">
          No results found
        </div>
      }
      popupRender={(menu) => (
        <>
          {menu}
          {filtered.length > 0 && (
            <button
              // Prevent the input blur that would close the popup before the click lands.
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleViewAll}
              aria-label="View all search results"
              className="w-full cursor-pointer border-t border-gray-100 px-4 py-2.5 text-center text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-50"
            >
              View all results{filtered.length > MAX_SUGGESTIONS ? ` (${filtered.length})` : ""}
            </button>
          )}
        </>
      )}
    >
      <Input
        size={config.size}
        placeholder={PLACEHOLDER}
        aria-label="Search typhoon names"
        prefix={<Search size={config.prefixSize} className={config.prefixClassName} />}
        allowClear
        onKeyDown={handleKeyDown}
        className={config.inputClassName}
      />
    </AutoComplete>
  );
};

export default SearchBar;
