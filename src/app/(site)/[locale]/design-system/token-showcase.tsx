import { Badge } from "@/components/ui/badge";

const brandSteps = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
] as const;

const semanticTokens = [
  { name: "background", className: "bg-background text-foreground" },
  { name: "foreground", className: "bg-foreground text-background" },
  { name: "muted", className: "bg-muted text-muted-foreground" },
  { name: "card", className: "bg-card text-card-foreground" },
  { name: "border", className: "bg-background text-foreground border-2 border-border" },
  { name: "ring", className: "bg-background text-foreground ring-4 ring-ring" },
  { name: "accent", className: "bg-accent text-accent-foreground" },
  { name: "success", className: "bg-success text-success-foreground" },
  { name: "warning", className: "bg-warning text-warning-foreground" },
  { name: "destructive", className: "bg-destructive text-white" },
] as const;

export function TokenShowcase() {
  return (
    <section className="section" aria-labelledby="tokens-heading">
      <h2 id="tokens-heading" className="mb-md">
        Colour tokens
      </h2>
      <p className="mb-lg max-w-prose text-muted-foreground">
        Brand violet is the live site primary <code>#7000FE</code>. Gold is reserved
        for quote and WhatsApp-adjacent CTAs.
      </p>
      <h3 className="mb-sm">Brand</h3>
      <div className="mb-xl grid grid-cols-2 gap-sm sm:grid-cols-4 lg:grid-cols-11">
        {brandSteps.map((step) => (
          <div key={step} className="space-y-2xs">
            <div
              className="aspect-square rounded-lg shadow-elevate-1"
              style={{ backgroundColor: `var(--color-brand-${step})` }}
            />
            <p className="text-xs font-medium">brand-{step}</p>
          </div>
        ))}
      </div>
      <h3 className="mb-sm">Semantic</h3>
      <div className="grid gap-sm sm:grid-cols-2 lg:grid-cols-5">
        {semanticTokens.map((token) => (
          <div
            key={token.name}
            className={`flex min-h-24 items-end rounded-lg p-sm shadow-elevate-1 ${token.className}`}
          >
            <span className="text-sm font-medium">{token.name}</span>
          </div>
        ))}
      </div>
      <div className="mt-lg flex flex-wrap gap-sm">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </div>
    </section>
  );
}
