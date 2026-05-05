import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

interface Props {
  sex: "male" | "female";
  heightIn: number;
  actualLb: number;
  ibwLb: number;
  pctIBW: number;
  kcal: number;
  fiberG: number;
  recommendedFiber: number;
}

export function AdimeBox(p: Props) {
  const [copied, setCopied] = useState(false);

  const note = useMemo(() => buildNote(p), [p]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(note);
    setCopied(true);
    toast.success("ADIME note copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="clinical-card bg-navy text-creme border-navy" aria-labelledby="tier-3-heading">
      <header className="flex items-start justify-between gap-3 mb-4">
        <div>
          <span className="tier-badge bg-red text-creme">TIER 03 / ADIME</span>
          <h2 id="tier-3-heading" className="text-xl md:text-2xl mt-2 text-creme">
            PES Statement Generator
          </h2>
        </div>
        <Button onClick={handleCopy}
          className="bg-red hover:bg-red/90 text-creme font-mono text-xs font-bold h-10 px-4 rounded-sm">
          {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
          {copied ? "COPIED" : "COPY"}
        </Button>
      </header>

      <pre
        className="mono text-xs md:text-sm leading-relaxed whitespace-pre-wrap bg-creme/5
                   border border-creme/20 rounded-sm p-4 text-creme overflow-x-auto"
        aria-live="polite"
      >
{note}
      </pre>
    </section>
  );
}

function buildNote(p: Props): string {
  const today = new Date().toISOString().slice(0, 10);
  const fiberDeficit = p.recommendedFiber - p.fiberG;
  const fiberAdequate = p.recommendedFiber > 0 && p.fiberG >= p.recommendedFiber * 0.9;
  const ibwStatus =
    !p.pctIBW ? "pending"
    : p.pctIBW < 90 ? "underweight"
    : p.pctIBW <= 110 ? "within IBW range"
    : p.pctIBW <= 120 ? "overweight" : "obese";

  const A =
`A — ASSESSMENT
  Sex .................. ${p.sex}
  Height ............... ${p.heightIn ? p.heightIn.toFixed(1) + " in" : "—"}
  Actual Weight ........ ${p.actualLb ? p.actualLb.toFixed(1) + " lb" : "—"}
  IBW (Hamwi) .......... ${p.ibwLb ? p.ibwLb.toFixed(0) + " lb" : "—"}
  % IBW ................ ${p.pctIBW ? p.pctIBW.toFixed(1) + "%  (" + ibwStatus + ")" : "—"}
  Energy Intake ........ ${p.kcal ? p.kcal + " kcal/day" : "—"}
  Fiber Intake ......... ${p.fiberG ? p.fiberG.toFixed(1) + " g/day" : "—"}
  Fiber Recommended .... ${p.recommendedFiber ? p.recommendedFiber.toFixed(1) + " g/day" : "—"}`;

  const pes = !p.recommendedFiber || !p.fiberG
    ? "  [Awaiting nutrient audit input to generate PES statement.]"
    : fiberAdequate
      ? `  No fiber-related nutrition diagnosis at this time.
  Fiber intake meets DGA recommendation (14 g / 1000 kcal).`
      : `  Inadequate fiber intake (NI-5.8.5) related to limited intake of
  whole grains, fruits, vegetables, and legumes as evidenced by
  reported intake of ${p.fiberG.toFixed(1)} g/day vs. DGA-recommended
  ${p.recommendedFiber.toFixed(1)} g/day (deficit of ${fiberDeficit.toFixed(1)} g/day,
  ${((p.fiberG / p.recommendedFiber) * 100).toFixed(0)}% of goal).`;

  const I = !p.recommendedFiber ? "  —" :
`  • Nutrition education (E-1.1): high-fiber food sources & label reading.
  • Goal: increase fiber to ≥ ${p.recommendedFiber.toFixed(0)} g/day over 4 weeks.
  • Encourage gradual increase (+5 g/wk) with adequate hydration (≥ 2 L/day).`;

  return `ADIME NOTE  //  ${today}
=====================================================

${A}

D — DIAGNOSIS (PES)
${pes}

I — INTERVENTION
${I}

M/E — MONITORING & EVALUATION
  • 24-hr recall at 2 & 4 wk follow-up.
  • Re-audit fiber adequacy vs. DGA target.
  • Reassess weight & % IBW trajectory.
=====================================================`;
}
