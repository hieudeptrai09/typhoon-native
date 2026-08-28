import { Popover } from "antd";
import { useId, type ReactNode } from "react";

const BAR_MAX_PX = 96;
const BAR_MIN_PX = 8;

export interface ComparisonBarRow {
  key: string;
  label: ReactNode;
  labelColor?: string;
  color: string;
  count: number;
  filled?: number;
  valueLabel?: ReactNode;
  details: ReactNode;
}

interface ComparisonBarListProps {
  heading: ReactNode;
  emptyText: ReactNode;
  rows: ComparisonBarRow[];
}

/** A list of groups whose bars compare their sizes against the largest group. */
const ComparisonBarList = ({ heading, emptyText, rows }: ComparisonBarListProps) => {
  const listId = useId();
  const maxCount = rows.reduce((max, row) => Math.max(max, row.count), 0);

  return (
    <div>
      <div className="mb-2 text-foreground">{heading}</div>
      {rows.length === 0 ? (
        <div className="text-sm text-foreground">{emptyText}</div>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => {
            const width =
              maxCount > 0 ? Math.max(BAR_MIN_PX, (row.count / maxCount) * BAR_MAX_PX) : BAR_MIN_PX;
            const filled = row.filled ?? row.count;
            const statsId = `${listId}-${row.key}`;

            return (
              <Popover
                key={row.key}
                styles={{ container: { backgroundColor: "#f3f4f6" } }}
                content={row.details}
                trigger={["hover", "click"]}
                placement="bottom"
              >
                <div
                  className="flex cursor-pointer items-center justify-between rounded-md bg-white px-3 py-2 transition-colors hover:bg-gray-200"
                  style={{ borderLeft: `4px solid ${row.color}` }}
                >
                  <span
                    className="font-semibold text-foreground"
                    style={{ color: row.labelColor }}
                    aria-describedby={statsId}
                  >
                    {row.label}
                  </span>
                  <div id={statsId} className="flex shrink-0 items-center gap-2">
                    <span
                      className="flex h-2 shrink-0 overflow-hidden rounded-full"
                      style={{ width: `${width}px`, backgroundColor: `${row.color}40` }}
                      aria-hidden="true"
                    >
                      <span
                        className="h-full rounded-full"
                        style={{
                          width: `${row.count > 0 ? (filled / row.count) * 100 : 0}%`,
                          backgroundColor: row.color,
                        }}
                      />
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-foreground">
                      <span className="sr-only">Count: </span>
                      {row.valueLabel ?? row.count}
                    </span>
                  </div>
                </div>
              </Popover>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ComparisonBarList;
