"use client";

import { SchemaForm } from "@/components/sections/editors/schema-form";
import type { EditorField, SectionEditorProps } from "@/lib/sections/types";

export function GenericSectionEditor({
  fields,
  data,
  onChangeData,
}: Pick<SectionEditorProps, "data" | "onChangeData"> & {
  fields: EditorField[];
}) {
  return <SchemaForm fields={fields} value={data} onChange={onChangeData} />;
}

export function makeSectionEditor(fields: EditorField[]) {
  function BoundEditor(props: SectionEditorProps) {
    return <GenericSectionEditor fields={fields} data={props.data} onChangeData={props.onChangeData} />;
  }
  BoundEditor.displayName = "BoundSectionEditor";
  return BoundEditor;
}
