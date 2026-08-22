"use client";

import { LocaleTabs } from "@/components/admin/locale-tabs";
import { SchemaForm } from "@/components/sections/editors/schema-form";
import { layoutEditorFields } from "@/lib/sections/layout";
import { asRecord } from "@/lib/sections/parse";
import { getSectionEditor } from "@/components/sections/editors/bound-editors";
import { getSectionCatalog } from "@/lib/sections/catalog";
import type { SectionType } from "@/generated/prisma/enums";
import type { JsonValue } from "@/types/content";

export function SectionPanel({
  type,
  settings,
  dataEn,
  dataAr,
  onChange,
}: {
  type: SectionType;
  settings: JsonValue;
  dataEn: JsonValue;
  dataAr: JsonValue;
  onChange: (patch: { settings?: JsonValue; dataEn?: JsonValue; dataAr?: JsonValue }) => void;
}) {
  const definition = getSectionCatalog(type);
  const Editor = getSectionEditor(type);
  const settingsRecord = asRecord(settings);
  const dataEnRecord = asRecord(dataEn);
  const dataArRecord = asRecord(dataAr);

  return (
    <div className="grid gap-8">
      <section className="grid gap-3">
        <h3 className="text-sm font-medium">Layout</h3>
        <SchemaForm
          fields={[...layoutEditorFields, ...definition.settingsFields]}
          value={settingsRecord}
          onChange={(next) => onChange({ settings: next })}
        />
      </section>
      <section>
        <h3 className="mb-3 text-sm font-medium">Content</h3>
        <LocaleTabs
          arabicTranslated={JSON.stringify(dataArRecord) !== "{}"}
          onCopyFromEnglish={() => onChange({ dataAr: dataEnRecord })}
          english={
            <Editor
              data={dataEnRecord}
              settings={settingsRecord}
              onChangeData={(data) => onChange({ dataEn: data })}
              onChangeSettings={(next) => onChange({ settings: next })}
            />
          }
          arabic={
            <Editor
              data={dataArRecord}
              settings={settingsRecord}
              onChangeData={(data) => onChange({ dataAr: data })}
              onChangeSettings={(next) => onChange({ settings: next })}
            />
          }
        />
      </section>
    </div>
  );
}
