import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  kcal: number; setKcal: (n: number) => void;
  fiberG: number; setFiberG: (n: number) => void;
}

export function NutrientAuditor({ kcal, setKcal, fiberG, setFiberG }: Props) {
  const recommended = useMemo(() => (kcal / 1000) * 14, [kcal]);
  const deficit = recommended - fiberG;
  const pct = recommended > 0 ? Math.min(100, (fiberG / recommended) * 100) : 0;
  const adequate = recommended > 0 && fiberG >= recommended * 0.9;

  return (
    <section className="clinical-card" aria-labelledby="tier-2-heading">
      <header className="mb-4">
        <span className="tier-badge">TIER 02 / NUTRIENT AUDIT</span>
        <h2 id="tier-2-heading" className="text-xl md:text-2xl mt-2 text-navy">
          Dietary Fiber — DGA 14g / 1000 kcal
        </h2>
      </header>

      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <div>
          <Label htmlFor="kcal" className="label-mono">Energy Intake (kcal/day)</Label>
          <Input id="kcal" type="number" inputMode="numeric"
            value={kcal || ""} onChange={e => setKcal(+e.target.value)}
            className="mt-1.5 font-mono text-lg h-11 border-2 border-navy/30 focus-visible:border-navy" />
        </div>
        <div>
          <Label htmlFor="fiber" className="label-mono">Fiber Intake (g/day)</Label>
          <Input id="fiber" type="number" inputMode="decimal"
            value={fiberG || ""} onChange={e => setFiberG(+e.target.value)}
            className="mt-1.5 font-mono text-lg h-11 border-2 border-navy/30 focus-visible:border-navy" />
        </div>
      </div>

      <div className="border-t-2 border-dashed border-navy/20 pt-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Readout label="Recommended" value={recommended ? `${recommended.toFixed(1)} g` : "—"} />
          <Readout label="Actual" value={fiberG ? `${fiberG.toFixed(1)} g` : "—"} />
          <Readout
            label="Deficit"
            value={recommended ? `${deficit > 0 ? "−" : "+"}${Math.abs(deficit).toFixed(1)} g` : "—"}
            tone={deficit > 0 ? "red" : "navy"}
          />
        </div>

        <div>
          <div className="flex justify-between mb-1.5">
            <span className="label-mono">Adequacy</span>
            <span className="font-mono text-xs font-bold text-navy">{pct.toFixed(0)}%</span>
          </div>
          <div className="h-3 bg-secondary rounded-sm overflow-hidden border border-navy/20">
            <div
              className={`h-full transition-all duration-300 ${adequate ? "bg-navy" : "bg-red"}`}
              style={{ width: `${pct}%` }}
              role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
            />
          </div>
          {recommended > 0 && (
            <p className={`mono text-xs font-bold mt-2 ${adequate ? "text-navy" : "text-red"}`}>
              {adequate ? "// ADEQUATE INTAKE" : "// INADEQUATE — INTERVENTION INDICATED"}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function Readout({ label, value, tone = "navy" }: { label: string; value: string; tone?: "navy" | "red" }) {
  return (
    <div>
      <div className="label-mono">{label}</div>
      <div className={`data-readout mt-1 ${tone === "red" ? "text-red" : ""}`}>{value}</div>
    </div>
  );
}
