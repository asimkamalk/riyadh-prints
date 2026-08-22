"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type PriceTierRow = {
  minQty: string;
  maxQty: string;
  unitPrice: string;
};

export function ProductPricingTab({
  basePrice,
  priceUnit,
  minOrderQty,
  tiers,
  onChange,
}: {
  basePrice: string;
  priceUnit: string;
  minOrderQty: string;
  tiers: PriceTierRow[];
  onChange: (patch: {
    basePrice?: string;
    priceUnit?: string;
    minOrderQty?: string;
    tiers?: PriceTierRow[];
  }) => void;
}) {
  return (
    <div className="grid max-w-xl gap-6">
      <div className="grid gap-2">
        <Label htmlFor="base-price">Base price (SAR)</Label>
        <Input
          id="base-price"
          inputMode="decimal"
          value={basePrice}
          onChange={(event) => onChange({ basePrice: event.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="price-unit">Unit</Label>
        <Input
          id="price-unit"
          value={priceUnit}
          placeholder="per piece, per box…"
          onChange={(event) => onChange({ priceUnit: event.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="min-qty">Minimum order quantity</Label>
        <Input
          id="min-qty"
          inputMode="numeric"
          value={minOrderQty}
          onChange={(event) => onChange({ minOrderQty: event.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label>Bulk price tiers</Label>
        {tiers.map((tier, index) => (
          <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
            <Input
              inputMode="numeric"
              placeholder="Min qty"
              value={tier.minQty}
              onChange={(event) => {
                const next = [...tiers];
                next[index] = { ...tier, minQty: event.target.value };
                onChange({ tiers: next });
              }}
            />
            <Input
              inputMode="numeric"
              placeholder="Max qty"
              value={tier.maxQty}
              onChange={(event) => {
                const next = [...tiers];
                next[index] = { ...tier, maxQty: event.target.value };
                onChange({ tiers: next });
              }}
            />
            <Input
              inputMode="decimal"
              placeholder="Unit price"
              value={tier.unitPrice}
              onChange={(event) => {
                const next = [...tiers];
                next[index] = { ...tier, unitPrice: event.target.value };
                onChange({ tiers: next });
              }}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Remove tier"
              onClick={() => onChange({ tiers: tiers.filter((_, i) => i !== index) })}
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
          onClick={() => onChange({ tiers: [...tiers, { minQty: "", maxQty: "", unitPrice: "" }] })}
        >
          <Plus className="size-4" />
          Add tier
        </Button>
      </div>
    </div>
  );
}
