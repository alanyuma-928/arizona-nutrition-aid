import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type Sex = "male" | "female";
export type Unit = "imperial" | "metric";

interface Props {
  sex: Sex; setSex: (s: Sex) => void;
  unit: Unit; setUnit: (u: Unit) => void;
  heightIn: number; setHeightIn: (n: number) => void;
  actualLb: number; setActualLb: (n: number) => void;
}

export function AssessmentBox(p: Props) {
  const ibwLb = useMemo(() => {
    if (p.heightIn < 60) return 0;
    const inchesOver = p.heightIn - 60;
    return p.sex === "male" ? 106 + 6 * inchesOver : 100 + 5 * inchesOver;
  }, [p.heightIn, p.sex]);

  const pctIBW = p.actualLb && ibwLb ? (p.actualLb / ibwLb) * 100 : 0;
  const ibwKg = ibwLb * 0.453592;
  const status =
    pctIBW === 0 ? "—" :
    pctIBW < 80 ? "SEVERELY UNDERWEIGHT" :
    pctIBW < 90 ? "UNDERWEIGHT" :
    pctIBW <= 110 ? "WITHIN IBW RANGE" :
    pctIBW <= 120 ? "OVERWEIGHT" : "OBESE";

  const statusColor = pctIBW === 0 ? "text-muted-foreground"
    : (pctIBW < 90 || pctIBW > 110) ? "text-red" : "text-navy";

  // local UI helpers for metric inputs
  const [cm, setCm] = useState<string>(() => (p.heightIn * 2.54).toFixed(0));
  const [kg, setKg] = useState<string>(() => (p.actualLb * 0.453592).toFixed(1));

  return (
    <section className="clinical-card" aria-labelledby="tier-1-heading">
      <header className="flex items-start justify-between gap-3 mb-4">
        <div>
          <span className="tier-badge">TIER 01 / ASSESSMENT</span>
          <h2 id="tier-1-heading" className="text-xl md:text-2xl mt-2 text-navy">
            Ideal Body Weight — Hamwi Method
          </h2>
        </div>
        <div role="group" aria-label="Unit toggle"
             className="flex border-2 border-navy rounded-sm overflow-hidden text-xs font-mono font-bold">
          {(["imperial", "metric"] as Unit[]).map(u => (
            <button key={u}
              onClick={() => p.setUnit(u)}
              className={`px-3 py-1.5 uppercase transition ${
                p.unit === u ? "bg-navy text-creme" : "bg-transparent text-navy hover:bg-navy/5"
              }`}
              aria-pressed={p.unit === u}>
              {u === "imperial" ? "US" : "SI"}
            </button>
          ))}
        </div>
      </header>

      <div className="grid sm:grid-cols-3 gap-4 mb-5">
        <div>
          <Label className="label-mono">Sex (biological)</Label>
          <div className="flex gap-2 mt-1.5">
            {(["male", "female"] as Sex[]).map(s => (
              <button key={s}
                onClick={() => p.setSex(s)}
                aria-pressed={p.sex === s}
                className={`flex-1 py-2 font-mono text-xs font-bold uppercase border-2 rounded-sm transition ${
                  p.sex === s
                    ? "bg-navy text-creme border-navy"
                    : "bg-transparent text-navy border-navy/30 hover:border-navy"
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {p.unit === "imperial" ? (
          <>
            <div>
              <Label htmlFor="height-in" className="label-mono">Height (in)</Label>
              <Input id="height-in" type="number" inputMode="decimal"
                value={p.heightIn || ""} onChange={e => p.setHeightIn(+e.target.value)}
                className="mt-1.5 font-mono text-lg h-11 border-2 border-navy/30 focus-visible:border-navy" />
            </div>
            <div>
              <Label htmlFor="weight-lb" className="label-mono">Actual Wt (lb)</Label>
              <Input id="weight-lb" type="number" inputMode="decimal"
                value={p.actualLb || ""} onChange={e => p.setActualLb(+e.target.value)}
                className="mt-1.5 font-mono text-lg h-11 border-2 border-navy/30 focus-visible:border-navy" />
            </div>
          </>
        ) : (
          <>
            <div>
              <Label htmlFor="height-cm" className="label-mono">Height (cm)</Label>
              <Input id="height-cm" type="number" inputMode="decimal" value={cm}
                onChange={e => { setCm(e.target.value); p.setHeightIn(+e.target.value / 2.54); }}
                className="mt-1.5 font-mono text-lg h-11 border-2 border-navy/30 focus-visible:border-navy" />
            </div>
            <div>
              <Label htmlFor="weight-kg" className="label-mono">Actual Wt (kg)</Label>
              <Input id="weight-kg" type="number" inputMode="decimal" value={kg}
                onChange={e => { setKg(e.target.value); p.setActualLb(+e.target.value / 0.453592); }}
                className="mt-1.5 font-mono text-lg h-11 border-2 border-navy/30 focus-visible:border-navy" />
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 border-t-2 border-dashed border-navy/20 pt-4">
        <Readout label="IBW" value={p.unit === "imperial" ? `${ibwLb.toFixed(0)} lb` : `${ibwKg.toFixed(1)} kg`} />
        <Readout label="% IBW" value={pctIBW ? `${pctIBW.toFixed(1)}%` : "—"} />
        <div className="col-span-2 md:col-span-1">
          <div className="label-mono">Status</div>
          <div className={`mono text-sm font-bold mt-1.5 ${statusColor}`}>{status}</div>
        </div>
      </div>
    </section>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label-mono">{label}</div>
      <div className="data-readout mt-1">{value}</div>
    </div>
  );
}
