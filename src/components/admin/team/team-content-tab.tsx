"use client";

import { Plus, Trash2 } from "lucide-react";

import { LocaleTabs } from "@/components/admin/locale-tabs";
import { SlugInput } from "@/components/admin/slug-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TeamSkill } from "@/lib/team-json";
import { Button } from "@/components/ui/button";
import type { TeamFormState } from "@/components/admin/team/team-form-state";

function SkillsEditor({
  label,
  rows,
  onChange,
}: {
  label: string;
  rows: TeamSkill[];
  onChange: (rows: TeamSkill[]) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {rows.map((row, index) => (
        <div key={index} className="grid gap-2 sm:grid-cols-[1fr_6rem_auto]">
          <Input
            value={row.label}
            placeholder="Skill label"
            onChange={(event) => {
              const next = [...rows];
              next[index] = { ...row, label: event.target.value };
              onChange(next);
            }}
          />
          <Input
            type="number"
            min={0}
            max={100}
            value={row.percent}
            onChange={(event) => {
              const next = [...rows];
              next[index] = { ...row, percent: Number(event.target.value) || 0 };
              onChange(next);
            }}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Remove skill"
            onClick={() => onChange(rows.filter((_, i) => i !== index))}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() => onChange([...rows, { label: "", percent: 80 }])}
      >
        <Plus className="size-4" />
        Add skill
      </Button>
    </div>
  );
}

export function TeamContentTab({
  values,
  excludeId,
  onChange,
}: {
  values: TeamFormState;
  excludeId?: string;
  onChange: (patch: Partial<TeamFormState>) => void;
}) {
  return (
    <LocaleTabs
      arabicTranslated={Boolean(values.nameAr.trim())}
      onCopyFromEnglish={() =>
        onChange({
          nameAr: values.nameEn,
          slugAr: values.slugEn,
          roleAr: values.roleEn,
          secondaryRoleAr: values.secondaryRoleEn,
          bioAr: values.bioEn,
          experienceAr: values.experienceEn,
          awardsAr: values.awardsEn,
          skillsAr: values.skillsEn,
        })
      }
      english={
        <TeamLocaleFields locale="en" values={values} excludeId={excludeId} onChange={onChange} />
      }
      arabic={
        <TeamLocaleFields locale="ar" values={values} excludeId={excludeId} onChange={onChange} />
      }
    />
  );
}

function TeamLocaleFields({
  locale,
  values,
  excludeId,
  onChange,
}: {
  locale: "en" | "ar";
  values: TeamFormState;
  excludeId?: string;
  onChange: (patch: Partial<TeamFormState>) => void;
}) {
  const isEn = locale === "en";
  return (
    <div className="grid gap-4" dir={isEn ? undefined : "rtl"}>
      <div className="grid gap-2">
        <Label>{isEn ? "Name" : "الاسم"}</Label>
        <Input
          value={isEn ? values.nameEn : values.nameAr}
          onChange={(event) => onChange(isEn ? { nameEn: event.target.value } : { nameAr: event.target.value })}
        />
      </div>
      <SlugInput
        title={(isEn ? values.nameEn : values.nameAr) || values.nameEn}
        value={isEn ? values.slugEn : values.slugAr}
        onChange={(slug) => onChange(isEn ? { slugEn: slug } : { slugAr: slug })}
        locale={locale}
        model="teamMember"
        pathPrefix="/about"
        excludeId={excludeId}
      />
      <div className="grid gap-2">
        <Label>{isEn ? "Primary role" : "الدور الأساسي"}</Label>
        <Input
          value={isEn ? values.roleEn : values.roleAr}
          onChange={(event) => onChange(isEn ? { roleEn: event.target.value } : { roleAr: event.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label>{isEn ? "Secondary role" : "الدور الثانوي"}</Label>
        <Input
          value={isEn ? values.secondaryRoleEn : values.secondaryRoleAr}
          onChange={(event) =>
            onChange(isEn ? { secondaryRoleEn: event.target.value } : { secondaryRoleAr: event.target.value })
          }
        />
      </div>
      <div className="grid gap-2">
        <Label>{isEn ? "Summary" : "الملخص"}</Label>
        <Textarea
          rows={4}
          value={isEn ? values.bioEn : values.bioAr}
          onChange={(event) => onChange(isEn ? { bioEn: event.target.value } : { bioAr: event.target.value })}
        />
      </div>
      <SkillsEditor
        label={isEn ? "Skills" : "المهارات"}
        rows={isEn ? values.skillsEn : values.skillsAr}
        onChange={(rows) => onChange(isEn ? { skillsEn: rows } : { skillsAr: rows })}
      />
      <div className="grid gap-2">
        <Label>{isEn ? "Personal experience" : "الخبرة الشخصية"}</Label>
        <Textarea
          rows={6}
          value={isEn ? values.experienceEn : values.experienceAr}
          onChange={(event) =>
            onChange(isEn ? { experienceEn: event.target.value } : { experienceAr: event.target.value })
          }
        />
      </div>
      <div className="grid gap-2">
        <Label>{isEn ? "Honors & awards" : "الجوائز والتكريم"}</Label>
        <Textarea
          rows={6}
          value={isEn ? values.awardsEn : values.awardsAr}
          onChange={(event) => onChange(isEn ? { awardsEn: event.target.value } : { awardsAr: event.target.value })}
        />
      </div>
    </div>
  );
}
