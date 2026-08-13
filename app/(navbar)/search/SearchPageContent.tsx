"use client";

import CountryFlag from "@/lib/components/CountryFlag";
import DefTable from "@/lib/components/DefTable";
import DidYouMean from "@/lib/components/DidYouMean";
import EmptyResults from "@/lib/components/EmptyResults";
import FrownError from "@/lib/components/FrownError";
import HighlightedName from "@/lib/components/HighlightedName";
import NameStatusIcon from "@/lib/components/NameStatusIcon";
import PageHeader from "@/lib/components/PageHeader";
import type { SearchResult } from "@/lib/types";
import { clickableRowProps } from "@/lib/utils/a11y";
import { Empty } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Search, SearchX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

const getColumns = (query: string): ColumnsType<SearchResult> => [
  {
    title: "#",
    key: "order",
    width: 52,
    fixed: "left" as const,
    render: (_: unknown, __: SearchResult, index: number) => (
      <span className="text-sm font-semibold text-sky-700">{index + 1}</span>
    ),
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    width: 100,
    fixed: "left" as const,
    sorter: (a, b) => a.name.localeCompare(b.name),
    render: (_: unknown, record: SearchResult) => (
      <span className="text-sky-700">
        <HighlightedName name={record.name} query={query} />
      </span>
    ),
  },
  {
    title: "Contributed By",
    dataIndex: "country",
    key: "country",
    sorter: (a, b) => a.country.localeCompare(b.country),
    render: (_: unknown, record: SearchResult) => <CountryFlag country={record.country} />,
  },
  {
    title: "Status",
    key: "status",
    sorter: (a, b) => Number(a.isRetired) - Number(b.isRetired),
    render: (_: unknown, record: SearchResult) => (
      <NameStatusIcon
        isRetired={record.isRetired}
        retirementReason={record.retirementReason ?? undefined}
        position={record.position}
        size={20}
      />
    ),
  },
  {
    title: "Storms",
    dataIndex: "stormCount",
    key: "stormCount",
    sorter: (a, b) => a.stormCount - b.stormCount,
    render: (count: number) => <span>x{count}</span>,
  },
  {
    title: "Replacement",
    dataIndex: "replacementName",
    key: "replacementName",
    render: (name: string | null) => (name ? <span>{name}</span> : null),
  },
  {
    title: "Note",
    dataIndex: "note",
    key: "note",
    render: (note: string | null) =>
      note ? (
        <span className="block max-w-[300px] wrap-break-word whitespace-normal">{note}</span>
      ) : null,
  },
];

interface SearchPageContentProps {
  results: SearchResult[];
  count: number;
  query: string;
  isError: boolean;
  similarNames?: string[];
}

export default function SearchPageContent({
  results,
  count,
  query,
  isError,
  similarNames = [],
}: SearchPageContentProps) {
  const router = useRouter();

  const columns = useMemo(() => getColumns(query), [query]);

  if (query.trim() && isError) {
    return <FrownError onRetry={() => router.refresh()} />;
  }

  return (
    <PageHeader title="Search Typhoon Names">
      <div className="mx-auto max-w-4xl">
        {!query.trim() ? (
          <div className="p-8">
            <Empty
              image={<Search size={64} strokeWidth={1.5} className="text-gray-400" />}
              imageStyle={{ height: 64, display: "flex", justifyContent: "center" }}
              description={<span className="text-foreground">Type a name to search</span>}
            />
          </div>
        ) : count === 0 ? (
          <EmptyResults
            icon={SearchX}
            description={`No typhoon names match "${query}". Check the spelling or try a shorter name.`}
            action={<DidYouMean names={similarNames} />}
          />
        ) : (
          <>
            <div id="search-result-count" className="mb-4 text-sm text-foreground">
              {count} result{count !== 1 ? "s" : ""} found
            </div>
            <div aria-describedby="search-result-count">
              <DefTable<SearchResult>
                maxWidth="max-w-4xl"
                dataSource={results}
                columns={columns}
                rowKey={(record) =>
                  record.id !== null ? String(record.id) : `storm-${record.name}`
                }
                onRow={(record) =>
                  clickableRowProps(`View details for ${record.name}`, () =>
                    router.push(`/info/${encodeURIComponent(record.name.toLowerCase())}/`, {
                      scroll: false,
                    }),
                  )
                }
              />
            </div>
          </>
        )}
      </div>
    </PageHeader>
  );
}
