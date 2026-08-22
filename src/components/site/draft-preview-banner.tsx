export function DraftPreviewBanner() {
  return (
    <p className="mb-6 rounded-md border border-dashed bg-muted px-4 py-2 text-sm">
      Draft preview — this page is not publicly listed.
    </p>
  );
}

export function firstSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}
