import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Activity, ArrowRight } from "lucide-react";
import { SSoT } from "@/lib/clinicalStandards";

export interface PagaState {
  activityMin: number;
  sedentaryHr: number;
  resistanceDays: number;
}

interface Props {
  paga: PagaState;
  setPaga: (p: PagaState) => void;
  onExport: () => void;
}

export function PagaAuditor({ paga, setPaga, onExport }: Props) {
  const lowActivity = paga.activityMin < SSoT.paga.moderateMinPerWeek;
  const highSedentary = paga.sedentaryHr > SSoT.paga.sedentaryMaxHoursPerDay;
  const lowResistance = paga.resistanceDays < SSoT.paga.resistanceMinDaysPerWeek;
  const flags = [lowActivity, highSedentary, lowResistance].filter(Boolean).length;

  return (
    <section className="clinical-card" aria-labelledby="paga-heading">
      <header className="flex items-start justify-between gap-3 mb-4">
        <div>
          <span className="tier-badge">TIER 02b / PAGA AUDIT</span>
          <h2 id="paga-heading" className="text-xl md:text-2xl mt-2 text-navy">
            Physical Activity — PAGA 2nd Ed.
          </h2>
        </div>
        <Activity className="w-6 h-6 text-navy/50 shrink-0" aria-hidden />
      </header>

      <div className="grid sm:grid-cols-3 gap-4 mb-5">
        <Field id="paga-activity" label="Mod. Activity (min/wk)" value={paga.activityMin}
          onChange={n => setPaga({ ...paga, activityMin: n })} />
        <Field id="paga-sedentary" label="Sedentary (hr/day)" value={paga.sedentaryHr}
          onChange={n => setPaga({ ...paga, sedentaryHr: n })} />
        <Field id="paga-resistance" label="Resistance (days/wk)" value={paga.resistanceDays}
          onChange={n => setPaga({ ...paga, resistanceDays: n })} />
      </div>

      <div className="border-t-2 border-dashed border-navy/20 pt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Flag active={lowActivity} label={`< ${SSoT.paga.moderateMinPerWeek} min/wk`} />
          <Flag active={highSedentary} label={`> ${SSoT.paga.sedentaryMaxHoursPerDay} hr sedentary`} />
          <Flag active={lowResistance} label={`< ${SSoT.paga.resistanceMinDaysPerWeek} resistance d/wk`} />
        </div>
        <Button onClick={onExport}
          className="bg-red hover:bg-red/90 text-creme font-mono text-xs font-bold h-10 px-4 rounded-sm">
          EXPORT TO ADIME ({flags})
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    </section>
  );
}

function Field({ id, label, value, onChange }:
  { id: string; label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div>
      <Label htmlFor={id} className="label-mono">{label}</Label>
      <Input id={id} type="number" inputMode="decimal" value={value || ""}
        onChange={e => onChange(+e.target.value)}
        className="mt-1.5 font-mono text-lg h-11 border-2 border-navy/30 focus-visible:border-navy" />
    </div>
  );
}

function Flag({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={`font-mono text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm border ${
      active ? "bg-red text-creme border-red" : "bg-creme text-navy/50 border-navy/20"
    }`}>
      {active ? "⚠ " : "✓ "}{label}
    </span>
  );
}
