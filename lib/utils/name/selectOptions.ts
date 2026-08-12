// The filter modals feed plain string lists straight into AntD <Select options={...}>.
export const toOpts = (items: string[]) => items.map((v) => ({ label: v, value: v }));
