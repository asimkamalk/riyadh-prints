export type KvRow = { key: string; value: string };

export type ProcessStep = {
  icon: string;
  title: string;
  description: string;
};

export const emptyTiptap = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export function parseKvRows(value: unknown): KvRow[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((row) => {
      if (!row || typeof row !== "object") {
        return null;
      }
      const record = row as { key?: unknown; value?: unknown };
      if (typeof record.key !== "string" && typeof record.value !== "string") {
        return null;
      }
      return {
        key: typeof record.key === "string" ? record.key : "",
        value: typeof record.value === "string" ? record.value : "",
      };
    })
    .filter((row): row is KvRow => row !== null);
}

export function parseStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

export function parseProcessSteps(value: unknown): ProcessStep[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((row) => {
      if (!row || typeof row !== "object") {
        return null;
      }
      const record = row as { icon?: unknown; title?: unknown; description?: unknown };
      return {
        icon: typeof record.icon === "string" ? record.icon : "",
        title: typeof record.title === "string" ? record.title : "",
        description: typeof record.description === "string" ? record.description : "",
      };
    })
    .filter((row): row is ProcessStep => row !== null);
}

export function compactKvRows(rows: KvRow[]): KvRow[] {
  return rows.filter((row) => row.key.trim() || row.value.trim());
}

export function compactStrings(rows: string[]): string[] {
  return rows.map((row) => row.trim()).filter(Boolean);
}

export function compactSteps(rows: ProcessStep[]): ProcessStep[] {
  return rows.filter((row) => row.title.trim() || row.description.trim());
}
