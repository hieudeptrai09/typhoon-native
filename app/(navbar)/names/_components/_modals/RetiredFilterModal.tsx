import { toOpts } from "@/app/(navbar)/names/_utils/selectOptions";
import DefModal from "@/lib/components/DefModal";
import type { BaseModalProps, RetiredFilterParams, RetirementReason } from "@/lib/types";
import { toArr, toStr } from "@/lib/utils/params";
import type { PositionValue } from "@/lib/utils/position";
import {
  getPositionTitle,
  isPartialPosition,
  positionFromValue,
  positionToValue,
} from "@/lib/utils/position";
import { Button, DatePicker, Form, Input, Select } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import PositionSelect from "../_widgets/PositionSelect";

interface RetiredFilterModalProps extends BaseModalProps {
  onApply: (filters: RetiredFilterParams) => void;
  countries: string[];
  initialFilters: RetiredFilterParams;
  matchCount: (filters: RetiredFilterParams) => number;
}

interface FormValues {
  name: string;
  year: Dayjs | undefined;
  country: string[];
  reason: string[];
  position: PositionValue;
}

const REASON_OPTIONS: { value: RetirementReason; label: string }[] = [
  { value: "destructive", label: "Destructive Storm" },
  { value: "language", label: "Language Problem" },
  { value: "misspell", label: "Misspelling" },
  { value: "special", label: "Special Storm" },
];

const toFilters = (values: FormValues): RetiredFilterParams => {
  const position = positionFromValue(values.position);
  return {
    name: values.name ?? "",
    year: values.year ? String(values.year.year()) : "",
    country: toStr(values.country),
    reason: toStr(values.reason),
    position: position != null ? String(position) : "",
    letter: "",
  };
};

const RetiredFilterModal = ({
  isOpen,
  onClose,
  onApply,
  countries,
  initialFilters,
  matchCount,
}: RetiredFilterModalProps) => {
  const [form] = Form.useForm<FormValues>();

  const openValues: FormValues = {
    name: initialFilters.name,
    year: initialFilters.year ? dayjs().year(Number(initialFilters.year)) : undefined,
    country: toArr(initialFilters.country),
    reason: toArr(initialFilters.reason),
    position: positionToValue(initialFilters.position ? Number(initialFilters.position) : null),
  };

  const clearedValues: FormValues = {
    name: "",
    year: undefined,
    country: [],
    reason: [],
    position: positionToValue(null),
  };

  const handleClearAll = () => {
    form.setFieldsValue(clearedValues);
    form.setFields([{ name: "position", errors: [] }]);
  };

  const watched = Form.useWatch([], form);
  const values = watched ?? openValues;
  const position = positionFromValue(values.position);
  const pending = toFilters(values);
  const hasFilters = Boolean(
    pending.name || pending.year || pending.country || pending.reason || pending.position,
  );
  const count = hasFilters ? matchCount(pending) : null;

  return (
    <DefModal
      open={isOpen}
      onClose={onClose}
      width={480}
      title={<span className="text-xl font-bold text-foreground">Filter Options</span>}
      footer={[
        <Button key="clear" onClick={handleClearAll} aria-label="Clear all filters">
          Clear All
        </Button>,
        <Button
          key="apply"
          type="primary"
          onClick={() => form.submit()}
          aria-label={
            count == null
              ? "Apply filters"
              : `Apply filters, ${count} retired ${count === 1 ? "name" : "names"} match`
          }
        >
          {count == null ? "Apply" : `Apply (${count})`}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(formValues: FormValues) => onApply(toFilters(formValues))}
        className="py-4"
        initialValues={openValues}
      >
        <Form.Item label="Name" name="name">
          <Input placeholder="Enter typhoon name..." allowClear />
        </Form.Item>

        <Form.Item label="Year" name="year">
          <DatePicker
            picker="year"
            placeholder="Select year..."
            className="w-full"
            minDate={dayjs().year(2000)}
            maxDate={dayjs()}
          />
        </Form.Item>

        <Form.Item label="Contributed By" name="country">
          <Select
            mode="multiple"
            placeholder="All Countries"
            options={toOpts(countries)}
            allowClear
          />
        </Form.Item>

        <Form.Item
          label="Position"
          name="position"
          extra={
            <span id="retired-position-help">
              {position != null
                ? `Cell ${getPositionTitle(position)} — position #${position} in the naming table`
                : "Pick the row and the contributing country of the cell in the naming table"}
            </span>
          }
          rules={[
            {
              validator: (_, value: PositionValue) =>
                isPartialPosition(value)
                  ? Promise.reject(new Error("Pick both a row and a country"))
                  : Promise.resolve(),
            },
          ]}
        >
          <PositionSelect />
        </Form.Item>

        <Form.Item label="Retirement Reason" name="reason" className="mb-0">
          <Select mode="multiple" placeholder="All Reasons" options={REASON_OPTIONS} allowClear />
        </Form.Item>
      </Form>
    </DefModal>
  );
};

export default RetiredFilterModal;
