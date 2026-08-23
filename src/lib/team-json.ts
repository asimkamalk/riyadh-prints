export type TeamSkill = {
  label: string;
  percent: number;
};

export type TeamSocials = {
  linkedin?: string;
  facebook?: string;
  twitter?: string;
};

export function parseTeamSkills(value: unknown): TeamSkill[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((row) => {
    if (!row || typeof row !== "object") {
      return [];
    }
    const label = "label" in row && typeof row.label === "string" ? row.label.trim() : "";
    const percentRaw = "percent" in row ? row.percent : 0;
    const percent =
      typeof percentRaw === "number"
        ? Math.min(100, Math.max(0, Math.round(percentRaw)))
        : typeof percentRaw === "string"
          ? Math.min(100, Math.max(0, Math.round(Number(percentRaw) || 0)))
          : 0;
    if (!label) {
      return [];
    }
    return [{ label, percent }];
  });
}

export function compactTeamSkills(rows: TeamSkill[]): TeamSkill[] {
  return rows
    .map((row) => ({
      label: row.label.trim(),
      percent: Math.min(100, Math.max(0, Math.round(row.percent))),
    }))
    .filter((row) => row.label);
}

export function parseTeamSocials(value: unknown): TeamSocials {
  if (!value || typeof value !== "object") {
    return {};
  }
  const row = value as Record<string, unknown>;
  return {
    linkedin: typeof row.linkedin === "string" ? row.linkedin.trim() : undefined,
    facebook: typeof row.facebook === "string" ? row.facebook.trim() : undefined,
    twitter: typeof row.twitter === "string" ? row.twitter.trim() : undefined,
  };
}

export function compactTeamSocials(socials: TeamSocials): TeamSocials | null {
  const next = {
    ...(socials.linkedin ? { linkedin: socials.linkedin } : {}),
    ...(socials.facebook ? { facebook: socials.facebook } : {}),
    ...(socials.twitter ? { twitter: socials.twitter } : {}),
  };
  return Object.keys(next).length ? next : null;
}
