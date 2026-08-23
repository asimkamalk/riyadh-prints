"use client";

import { MediaField } from "@/components/admin/media-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { TeamFormState } from "@/components/admin/team/team-form-state";

export function TeamSettingsTab({
  values,
  onChange,
}: {
  values: TeamFormState;
  onChange: (patch: Partial<TeamFormState>) => void;
}) {
  return (
    <div className="grid max-w-xl gap-6">
      <MediaField label="Profile photo" value={values.avatar} onChange={(avatar) => onChange({ avatar })} />
      <div className="grid gap-2">
        <Label htmlFor="team-email">Email</Label>
        <Input
          id="team-email"
          type="email"
          value={values.email}
          onChange={(event) => onChange({ email: event.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="team-phone">Phone</Label>
        <Input
          id="team-phone"
          value={values.phone}
          onChange={(event) => onChange({ phone: event.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="team-linkedin">LinkedIn URL</Label>
        <Input
          id="team-linkedin"
          value={values.socials.linkedin ?? ""}
          onChange={(event) =>
            onChange({ socials: { ...values.socials, linkedin: event.target.value } })
          }
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="team-facebook">Facebook URL</Label>
        <Input
          id="team-facebook"
          value={values.socials.facebook ?? ""}
          onChange={(event) =>
            onChange({ socials: { ...values.socials, facebook: event.target.value } })
          }
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="team-twitter">Twitter/X URL</Label>
        <Input
          id="team-twitter"
          value={values.socials.twitter ?? ""}
          onChange={(event) =>
            onChange({ socials: { ...values.socials, twitter: event.target.value } })
          }
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="team-sort">Sort order</Label>
        <Input
          id="team-sort"
          type="number"
          min={0}
          value={values.sortOrder}
          onChange={(event) => onChange({ sortOrder: Number(event.target.value) || 0 })}
        />
      </div>
      <label className="flex items-center justify-between gap-3 text-sm">
        Visible on site
        <Switch checked={values.isVisible} onCheckedChange={(isVisible) => onChange({ isVisible })} />
      </label>
    </div>
  );
}
