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
      <div>
        <h3 className="text-base font-semibold tracking-tight">Editing {definition.label}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Wrap a word in **double asterisks** to colour it purple on the site.
        </p>
      </div>
      <section>
        <h4 className="mb-3 text-sm font-medium">Content</h4>
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
      <section className="grid gap-3 border-t pt-6">
        <h4 className="text-sm font-medium">Layout</h4>
        <SchemaForm
          className="sm:grid-cols-2"
          fields={[...layoutEditorFields, ...definition.settingsFields]}
          value={settingsRecord}
          onChange={(next) => onChange({ settings: next })}
        />
      </section>
    </div>
  );
}
