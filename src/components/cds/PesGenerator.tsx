import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Wand2, Check } from "lucide-react";
import { toast } from "sonner";
import { isFiberAdequate, SSoT } from "@/lib/clinicalStandards";
import type { PagaState } from "./PagaAuditor";

interface Props {
  fiberG: number;
  recommendedFiber: number;
  paga: PagaState;
  onAccept: (statement: string) => void;
}

const PROBLEMS = [
  { value: "NI-5.8.5", label: "Inadequate fiber intake (NI-5.8.5)" },
  { value: "NB-2.1",   label: "Physical inactivity (NB-2.1)" },
  { value: "NB-2.2",   label: "Excessive physical activity (NB-2.2)" },
  { value: "NI-1.2",   label: "Inadequate energy intake (NI-1.2)" },
  { value: "NI-1.3",   label: "Excessive energy intake (NI-1.3)" },
];

export function PesGenerator({ fiberG, recommendedFiber, paga, onAccept }: Props) {
  const [open, setOpen] = useState(false);
  const [smartFill, setSmartFill] = useState(true);
  const [problem, setProblem] = useState<string>("NB-2.1");
  const [etiology, setEtiology] = useState("");
  const [signs, setSigns] = useState("");
  const [accepted, setAccepted] = useState(false);

  const lowAerobic    = paga.activityMin < SSoT.paga.moderateMinPerWeek;
  const highSedentary = paga.sedentaryHr > SSoT.paga.sedentaryMaxHoursPerDay;
  const lowResistance = paga.resistanceDays < SSoT.paga.resistanceMinDaysPerWeek;
  const fiberAdequate = isFiberAdequate(fiberG, recommendedFiber);

  // Auto-suggested problem code based on PAGA / fiber findings
  const suggestedProblem = useMemo(() => {
    if (lowAerobic || lowResistance) return "NB-2.1";
    if (!fiberAdequate && recommendedFiber > 0) return "NI-5.8.5";
    return null;
  }, [lowAerobic, lowResistance, fiberAdequate, recommendedFiber]);

  const smartEtiology = useMemo(() => {
    const parts: string[] = [];
    if (highSedentary) parts.push(`a self-reported high-sedentary lifestyle (>${SSoT.paga.sedentaryMaxHoursPerDay} hours/day)`);
    if (lowResistance) parts.push(`limited engagement in muscle-strengthening activity`);
    if (lowAerobic)    parts.push(`insufficient moderate aerobic activity relative to PAGA guidance`);
    if (!fiberAdequate && recommendedFiber > 0)
      parts.push(`limited intake of whole grains, fruits, vegetables, and legumes`);
    return parts.length ? parts.join(" and ") : "";
  }, [highSedentary, lowResistance, lowAerobic, fiberAdequate, recommendedFiber]);

  const smartSigns = useMemo(() => {
    const parts: string[] = [];
    parts.push(`PAGA Auditor results showing ${paga.activityMin} minutes of moderate aerobic activity and ${paga.resistanceDays} day(s) of resistance training per week`);
    if (highSedentary) parts.push(`${paga.sedentaryHr} hours/day sedentary time`);
    if (recommendedFiber > 0)
      parts.push(`reported fiber intake of ${fiberG.toFixed(1)} g/day vs. DGA-recommended ${recommendedFiber.toFixed(1)} g/day`);
    return parts.join("; ");
  }, [paga, highSedentary, fiberG, recommendedFiber]);

  // Real-time smart-fill
  useEffect(() => {
    if (!smartFill) return;
    setEtiology(smartEtiology);
    setSigns(smartSigns);
  }, [smartFill, smartEtiology, smartSigns]);

  const problemLabel = PROBLEMS.find(p => p.value === problem)?.label ?? problem;

  const statement = useMemo(() => {
    const e = etiology.trim() || "[etiology]";
    const s = signs.trim() || "[signs/symptoms]";
    return `${problemLabel} related to ${e} as evidenced by ${s}.`;
  }, [problemLabel, etiology, signs]);

  const autoSuggestProblem = () => {
    if (!suggestedProblem) {
      toast.info("No PAGA/fiber deficit currently flagged — manual selection retained.");
      return;
    }
    setProblem(suggestedProblem);
    toast.success(`Auto-suggested: ${PROBLEMS.find(x => x.value === suggestedProblem)?.label}`);
  };

  const handleAccept = () => {
    onAccept(statement);
    setAccepted(true);
    toast.success("PES statement pulled into Diagnosis field");
    setTimeout(() => { setAccepted(false); setOpen(false); }, 700);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-red hover:bg-red/90 text-creme font-mono text-xs font-bold h-10 rounded-sm">
          <Sparkles className="w-4 h-4 mr-1.5" />
          LAUNCH PES STATEMENT GENERATOR
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-w-2xl w-[95vw] max-h-[92vh] overflow-y-auto bg-creme text-navy border-2 border-navy p-0"
        aria-labelledby="pes-gen-heading"
      >
        <DialogHeader className="bg-navy text-creme p-5 border-b-2 border-red space-y-2">
          <span className="inline-flex w-fit font-mono text-[10px] font-bold uppercase tracking-widest bg-red text-creme px-2 py-1 rounded-sm">
            DIAGNOSIS / PES GENERATOR
          </span>
          <DialogTitle id="pes-gen-heading" className="text-creme text-xl md:text-2xl font-extrabold">
            PES Statement Generator
          </DialogTitle>
          <DialogDescription className="text-creme/85 font-mono text-xs">
            Smart-fill pulls live data from the Assessment & PAGA Auditor.
          </DialogDescription>
        </DialogHeader>

        <article className="p-5 md:p-6 space-y-5">
          {/* Smart-Fill toggle */}
          <div className="flex items-center justify-between bg-card border-2 border-navy/30 rounded-sm p-3">
            <div>
              <Label htmlFor="smart-fill" className="font-extrabold text-navy text-sm">
                Use Smart-Fill from Assessment
              </Label>
              <p className="font-mono text-[11px] text-navy/70 mt-0.5">
                Etiology & Signs update in real time from PAGA + fiber data.
              </p>
            </div>
            <Switch id="smart-fill" checked={smartFill} onCheckedChange={setSmartFill} />
          </div>

          {/* Problem */}
          <div>
            <div className="flex items-end justify-between gap-2 mb-1.5">
              <Label htmlFor="pes-problem" className="label-mono">Problem (P)</Label>
              <Button
                onClick={autoSuggestProblem}
                variant="outline"
                className="h-8 px-2 font-mono text-[10px] font-bold border-2 border-navy text-navy hover:bg-navy hover:text-creme rounded-sm"
              >
                <Wand2 className="w-3 h-3 mr-1" /> AUTO-SUGGEST
              </Button>
            </div>
            <select
              id="pes-problem"
              value={problem}
              onChange={e => setProblem(e.target.value)}
              className="w-full h-11 font-mono text-sm bg-card text-navy border-2 border-navy/30 focus-visible:border-navy focus-visible:outline-none rounded-md px-3"
            >
              {PROBLEMS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            {suggestedProblem && (
              <p className="font-mono text-[11px] text-red mt-1.5">
                ⚠ PAGA/fiber deficit flagged — suggested: {PROBLEMS.find(x => x.value === suggestedProblem)?.label}
              </p>
            )}
          </div>

          {/* Etiology */}
          <div>
            <Label htmlFor="pes-etiology" className="label-mono">Etiology (E) — "related to"</Label>
            <Textarea
              id="pes-etiology"
              value={etiology}
              onChange={e => { setSmartFill(false); setEtiology(e.target.value); }}
              placeholder="e.g., a self-reported high-sedentary lifestyle (>8 hours/day)"
              className="mt-1.5 min-h-[80px] font-mono text-sm bg-card text-navy border-2 border-navy/30 focus-visible:border-navy placeholder:text-navy/55"
            />
          </div>

          {/* Signs / Symptoms */}
          <div>
            <Label htmlFor="pes-signs" className="label-mono">Signs / Symptoms (S) — "as evidenced by"</Label>
            <Textarea
              id="pes-signs"
              value={signs}
              onChange={e => { setSmartFill(false); setSigns(e.target.value); }}
              placeholder="e.g., PAGA Auditor results showing only 60 minutes of moderate aerobic activity and 0 days of resistance training per week"
              className="mt-1.5 min-h-[100px] font-mono text-sm bg-card text-navy border-2 border-navy/30 focus-visible:border-navy placeholder:text-navy/55"
            />
          </div>

          {/* Live Preview */}
          <section aria-labelledby="pes-preview-heading">
            <h3 id="pes-preview-heading" className="label-mono mb-2">Live PES Preview</h3>
            <blockquote
              className="theme-pes-preview bg-navy text-creme border-l-4 border-red rounded-sm p-4 font-mono text-sm leading-relaxed"
              aria-live="polite"
            >
              {statement}
            </blockquote>
          </section>

          <footer className="pt-3 border-t-2 border-dashed border-navy/30 flex flex-wrap justify-end gap-2">
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              className="font-mono text-xs font-bold h-10 border-2 border-navy text-navy hover:bg-navy hover:text-creme rounded-sm"
            >
              CANCEL
            </Button>
            <Button
              onClick={handleAccept}
              className="bg-red hover:bg-red/90 text-creme font-mono text-xs font-bold h-10 px-4 rounded-sm"
            >
              {accepted ? <Check className="w-4 h-4 mr-1.5" /> : <Sparkles className="w-4 h-4 mr-1.5" />}
              {accepted ? "PULLED" : "PULL INTO DIAGNOSIS"}
            </Button>
          </footer>
        </article>
      </DialogContent>
    </Dialog>
  );
}
