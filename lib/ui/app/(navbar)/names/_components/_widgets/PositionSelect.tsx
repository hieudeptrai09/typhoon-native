"use client";

import { COUNTRY_NAMES } from "@/lib/components/CountryFlag";
import type { PositionValue } from "@/lib/utils/position";
import { GRID_ROWS, positionColumnLetter } from "@/lib/utils/position";
import { Select, Space } from "antd";

const ROW_OPTIONS = Array.from({ length: GRID_ROWS }, (_, idx) => ({
  value: idx + 1,
  label: `Row ${idx + 1}`,
}));

const COLUMN_OPTIONS = COUNTRY_NAMES.map((country, col) => ({
  value: col,
  country,
  label: (
    <span className="flex items-center gap-2">
      <span className="truncate">{country}</span>
      <span className="ml-auto text-xs text-foreground/50">{positionColumnLetter(col)}</span>
    </span>
  ),
}));

interface PositionSelectProps {
  id?: string;
  value?: PositionValue;
  onChange?: (value: PositionValue) => void;
}

const PositionSelect = ({ id, value = {}, onChange }: PositionSelectProps) => (
  <Space.Compact className="w-full">
    <Select
      id={id}
      className="w-2/5"
      placeholder="Row"
      allowClear
      value={value.row}
      onChange={(row?: number) => onChange?.({ ...value, row: row ?? undefined })}
      options={ROW_OPTIONS}
      aria-label="Grid row"
    />
    <Select
      className="w-3/5"
      placeholder="Country"
      allowClear
      showSearch
      value={value.col}
      onChange={(col?: number) => onChange?.({ ...value, col: col ?? undefined })}
      options={COLUMN_OPTIONS}
      filterOption={(input, option) =>
        (option?.country ?? "").toLowerCase().includes(input.toLowerCase())
      }
      aria-label="Grid country column"
    />
  </Space.Compact>
);

export default PositionSelect;
