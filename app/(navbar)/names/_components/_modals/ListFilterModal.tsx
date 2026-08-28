import { toOpts } from "@/app/(navbar)/names/_utils/selectOptions";
import DefModal from "@/lib/components/DefModal";
import type { BaseModalProps, FilterParams } from "@/lib/types";
import { toArr, toStr } from "@/lib/utils/params";
import type { PositionValue } from "@/lib/utils/position";
import {
  getPositionTitle,
  isPartialPosition,
  positionFromValue,
  positionToValue,
} from "@/lib/utils/position";
import { Button, Form, Input, Radio, Select } from "antd";
import PositionSelect from "../_widgets/PositionSelect";

export interface ListFilterModalProps extends BaseModalProps {
  onApply: (filters: FilterParams) => void;
  countries: string[];
  languages: string[];
  tags: string[];
  initialFilters: FilterParams;
  showHistory: boolean;
  matchCount: (filters: FilterParams) => number;
}

interface FormValues {
  name: string;
  country: string[];
  language: string[];
  tag: string[];
  position: PositionValue;
  status: string | undefined;
}

const toFilters = (values: FormValues): FilterParams => {
  const position = positionFromValue(values.position);
  return {
    name: values.name ?? "",
    country: toStr(values.country),
    language: toStr(values.language),
    tag: toStr(values.tag),
    position: position != null ? String(position) : "",
    status: values.status ?? "",
    letter: "",
  };
};

const ListFilterModal = ({
  isOpen,
  onClose,
  onApply,
  countries,
  languages,
  tags,
  initialFilters,
  showHistory,
  matchCount,
}: ListFilterModalProps) => {
  const [form] = Form.useForm<FormValues>();

  const openValues: FormValues = {
    name: initialFilters.name,
    country: toArr(initialFilters.country),
    language: toArr(initialFilters.language),
    tag: toArr(initialFilters.tag),
    position: positionToValue(initialFilters.position ? Number(initialFilters.position) : null),
    status: showHistory ? initialFilters.status || "" : "current",
  };

  const clearedValues: FormValues = {
    name: "",
    country: [],
    language: [],
    tag: [],
    position: positionToValue(null),
    status: showHistory ? "" : "current",
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
    pending.name ||
    pending.country ||
    pending.language ||
    pending.tag ||
    pending.position ||
    (showHistory && pending.status),
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
              : `Apply filters, ${count} ${count === 1 ? "name" : "names"} match`
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

        <Form.Item label="Contributed By" name="country">
          <Select
            mode="multiple"
            placeholder="All Countries"
            options={toOpts(countries)}
            allowClear
          />
        </Form.Item>

        <Form.Item label="Language" name="language">
          <Select
            mode="multiple"
            placeholder="All Languages"
            options={toOpts(languages)}
            allowClear
          />
        </Form.Item>

        <Form.Item label="Tag" name="tag">
          <Select mode="multiple" placeholder="All Tags" options={toOpts(tags)} allowClear />
        </Form.Item>

        <Form.Item
          label="Position"
          name="position"
          extra={
            <span id="filter-position-help">
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

        {showHistory && (
          <Form.Item label="Status" name="status" className="mb-0">
            <Radio.Group>
              <Radio value="">All</Radio>
              <Radio value="active">Active</Radio>
              <Radio value="retired">Retired</Radio>
            </Radio.Group>
          </Form.Item>
        )}
      </Form>
    </DefModal>
  );
};

export default ListFilterModal;
