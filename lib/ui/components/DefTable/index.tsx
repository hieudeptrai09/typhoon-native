"use client";

import type { TableProps } from "antd";
import { Table } from "antd";
import type { ColumnsType, ColumnType } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import { useMemo, useRef, useState } from "react";
import ScrollEndFade from "../ScrollEndFade";
import {
  nextCriteria,
  sortPriority,
  type SortCriterion,
  type SortDirection,
  type SortKey,
} from "./sorting";
import "./styles.css";

interface DefTableProps<T> {
  columns: ColumnsType<T>;
  dataSource: T[];
  rowKey: TableProps<T>["rowKey"];
  onRow?: TableProps<T>["onRow"];
  rowClickable?: (record: T, index: number) => boolean;
  maxWidth: string;
  tableKey?: React.Key;
}

// Only columns with an explicit `key` can be tracked: that is what antd reports
// back as `columnKey` when a header is clicked.
const sortKeyOf = <T,>(column: ColumnsType<T>[number]): SortKey | undefined =>
  typeof column.key === "string" || typeof column.key === "number" ? column.key : undefined;

const toCriterion = <T,>(result: SorterResult<T>): SortCriterion[] => {
  const key = result.columnKey;
  if (!result.order || (typeof key !== "string" && typeof key !== "number")) return [];
  return [{ key, order: result.order as SortDirection }];
};

const DefTable = <T extends object>({
  columns,
  dataSource,
  rowKey,
  onRow,
  rowClickable,
  maxWidth,
  tableKey,
}: DefTableProps<T>) => {
  const [criteria, setCriteria] = useState<SortCriterion[]>([]);
  // Touch devices have no shift key, so the toolbar offers a one-shot add mode.
  const [addNext, setAddNext] = useState(false);
  const shiftHeldRef = useRef(false);

  const isRowClickable = rowClickable ?? (() => Boolean(onRow));

  const sortableLabels = useMemo(() => {
    const labels = new Map<SortKey, string>();
    columns.forEach((column) => {
      const key = sortKeyOf(column);
      if (key === undefined || !(column as ColumnType<T>).sorter) return;
      labels.set(key, typeof column.title === "string" ? column.title : String(key));
    });
    return labels;
  }, [columns]);

  // Columns change with the view's filter, so criteria can outlive their column.
  const activeCriteria = useMemo(
    () => criteria.filter((criterion) => sortableLabels.has(criterion.key)),
    [criteria, sortableLabels],
  );

  const sortedColumns = useMemo<ColumnsType<T>>(
    () =>
      columns.map((column) => {
        const key = sortKeyOf(column);
        const { sorter } = column as ColumnType<T>;
        if (key === undefined || typeof sorter !== "function") return column;

        const rank = activeCriteria.findIndex((criterion) => criterion.key === key);
        return {
          ...column,
          sorter: { compare: sorter, multiple: sortPriority(rank, activeCriteria.length) },
          sortOrder: rank === -1 ? null : activeCriteria[rank].order,
        };
      }),
    [columns, activeCriteria],
  );

  const handleChange: TableProps<T>["onChange"] = (_pagination, _filters, sorter, extra) => {
    if (extra.action !== "sort") return;
    const reported = (Array.isArray(sorter) ? sorter : [sorter]).flatMap(toCriterion);

    setCriteria(nextCriteria(activeCriteria, reported, shiftHeldRef.current || addNext));
    setAddNext(false);
  };

  return (
    <div className={`mx-auto ${maxWidth}`}>
      {activeCriteria.length > 0 && (
        <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <span className="font-semibold text-foreground">Sorted by:</span>
          {activeCriteria.map((criterion, index) => (
            <span
              key={String(criterion.key)}
              className="inline-flex items-center gap-1 rounded-sm bg-sky-100 px-1.5 py-0.5 font-semibold text-sky-700"
            >
              {activeCriteria.length > 1 && <span className="text-sky-500">{index + 1}</span>}
              {sortableLabels.get(criterion.key)}
              <span aria-hidden="true">{criterion.order === "ascend" ? "↑" : "↓"}</span>
              <span className="sr-only">
                {criterion.order === "ascend" ? "ascending" : "descending"}
              </span>
            </span>
          ))}
          <button
            type="button"
            onClick={() => setAddNext((pending) => !pending)}
            aria-pressed={addNext}
            title="Shift-click a column header to add a sort criterion"
            className="cursor-pointer text-sky-700 underline underline-offset-2 hover:text-sky-900"
          >
            {addNext ? "Pick a column…" : "+ Add criterion"}
          </button>
          <button
            type="button"
            onClick={() => {
              setAddNext(false);
              setCriteria([]);
            }}
            className="cursor-pointer text-sky-700 underline underline-offset-2 hover:text-sky-900"
          >
            Clear
          </button>
        </div>
      )}
      <ScrollEndFade
        // antd sorts on click and on Enter; both are preceded by an event that
        // still carries the modifier key.
        onMouseDownCapture={(event) => {
          shiftHeldRef.current = event.shiftKey;
        }}
        onKeyDownCapture={(event) => {
          shiftHeldRef.current = event.shiftKey;
        }}
      >
        <Table<T>
          key={tableKey}
          dataSource={dataSource}
          columns={sortedColumns}
          rowKey={rowKey}
          onRow={onRow}
          onChange={handleChange}
          rowClassName={(record, index) =>
            `${isRowClickable(record, index) ? "cursor-pointer" : "cursor-default"} ${
              index % 2 === 0 ? "bg-white" : "bg-sky-100"
            }`
          }
          pagination={false}
          size="large"
          className="typhoon-table"
          scroll={{ x: "max-content" }}
          sticky
        />
      </ScrollEndFade>
    </div>
  );
};

export default DefTable;
