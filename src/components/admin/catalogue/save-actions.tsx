"use client";

import { Button } from "@/components/ui/button";

export function CatalogueSaveActions({
  disabled,
  onSave,
  onContinue,
  onPreview,
}: {
  disabled: boolean;
  onSave: () => void;
  onContinue: () => void;
  onPreview: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" disabled={disabled} onClick={onSave}>
        Save
      </Button>
      <Button type="button" variant="outline" disabled={disabled} onClick={onContinue}>
        Save & Continue
      </Button>
      <Button type="button" disabled={disabled} onClick={onPreview}>
        Save & Preview
      </Button>
    </div>
  );
}
