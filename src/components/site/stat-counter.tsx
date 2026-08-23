"use client";

import { useEffect, useState } from "react";

import { formatStatNumber, parseStatNumber } from "@/components/site/format";
import { useInView } from "@/components/site/reveal";

export function StatCounter({
  prefix,
  value,
  suffix,
}: {
  prefix: string | null;
  value: string;
  suffix: string | null;
}) {
  return (
            <p className="text-3xl font-bold tabular-nums">
      {prefix}
      <StatValue value={value} />
      {suffix}
    </p>
  );
}

function StatValue({ value }: { value: string }) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [shown, setShown] = useState(value);
  const target = parseStatNumber(value);

  useEffect(() => {
    if (!inView || target == null) {
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(value);
      return;
    }
    const duration = 900;
    const endValue = target;
    let frame = 0;
    const started = performance.now();
    function tick(now: number) {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setShown(formatStatNumber(endValue * eased, value));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setShown(value);
      }
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target, value]);

  return (
    <span ref={ref} className="inline-grid tabular-nums">
      <span className="invisible col-start-1 row-start-1" aria-hidden>
        {value}
      </span>
      <span className="col-start-1 row-start-1">{shown}</span>
    </span>
  );
}
