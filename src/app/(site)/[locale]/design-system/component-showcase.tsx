import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const buttonVariants = [
  "default",
  "accent",
  "secondary",
  "outline",
  "ghost",
  "link",
  "destructive",
] as const;

const buttonSizes = ["sm", "default", "lg"] as const;

export function ComponentShowcase() {
  return (
    <section className="section" aria-labelledby="components-heading">
      <h2 id="components-heading" className="mb-md">
        Buttons and cards
      </h2>
      <h3 className="mb-sm">Button variants</h3>
      <div className="mb-lg flex flex-wrap items-center gap-sm">
        {buttonVariants.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant === "accent" ? "Request a Quote" : variant}
          </Button>
        ))}
      </div>
      <h3 className="mb-sm">Button sizes</h3>
      <div className="mb-xl flex flex-wrap items-center gap-sm">
        {buttonSizes.map((size) => (
          <Button key={size} size={size}>
            {size}
          </Button>
        ))}
        <Button size="icon" aria-label="Icon-only example">
          +
        </Button>
      </div>
      <h3 className="mb-sm">Card elevations</h3>
      <div className="grid gap-lg md:grid-cols-3">
        <Card className="shadow-elevate-1">
          <CardHeader>
            <CardTitle>Elevate 1</CardTitle>
            <CardDescription>Resting surface — lists and compact cards.</CardDescription>
          </CardHeader>
          <CardContent>
            Warm paper surface with a faint violet umbra.
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm">
              Details
            </Button>
          </CardFooter>
        </Card>
        <Card className="shadow-elevate-2">
          <CardHeader>
            <CardTitle>Elevate 2</CardTitle>
            <CardDescription>Raised — product tiles and quote prompts.</CardDescription>
          </CardHeader>
          <CardContent>
            Use for catalogue cards that need to sit above the page.
          </CardContent>
          <CardFooter>
            <Button variant="accent" size="sm">
              Request a Quote
            </Button>
          </CardFooter>
        </Card>
        <Card className="shadow-elevate-3">
          <CardHeader>
            <CardTitle>Elevate 3</CardTitle>
            <CardDescription>Hero overlays and modal-like panels.</CardDescription>
          </CardHeader>
          <CardContent>
            Strongest lift. Keep rare so the hierarchy stays honest.
          </CardContent>
          <CardFooter>
            <Button size="sm">Continue</Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
