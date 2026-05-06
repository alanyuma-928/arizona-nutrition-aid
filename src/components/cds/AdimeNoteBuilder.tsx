import { useEffect, useMemo, useState } from "react";
import { usePersistentState, CDS_STORAGE_PREFIX } from "@/lib/usePersistentState";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, Copy, Download, FileText, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ibwCategory, isFiberAdequate, SSoT } from "@/lib/clinicalStandards";
import { PesGenerator } from "./PesGenerator";
import { ClientEducation } from "./ClientEducation";
import type { PagaState } from "./PagaAuditor";

type TabKey = "A" | "D" | "I" | "M" | "E" | "C";

interface Props {
  sex: "male" | "female";
  heightIn: number;
  actualLb: number;
  ibwLb: number;
  pctIBW: number;
  kcal: number;
  fiberG: number;
  recommendedFiber: number;
  paga: PagaState;
  /** Increment to programmatically open the dialog (e.g., from PAGA Export). */
  openSignal?: number;
  /** Tab to focus when openSignal changes. */
  initialTab?: TabKey;
}

const TABS: { key: TabKey; label: string; full: string }[] = [
  { key: "A", label: "A", full: "Assessment" },
  { key: "D", label: "D", full: "Diagnosis" },
  { key: "I", label: "I", full: "Intervention" },
  { key: "M", label: "M", full: "Monitoring" },
  { key: "E", label: "E", full: "Evaluation" },
  { key: "C", label: "C", full: "Client Ed" },
];

interface Suggestion { id: string; text: string; }

function buildPagaSuggestions(paga: PagaState): Suggestion[] {
  const out: Suggestion[] = [];
  if (paga.activityMin < SSoT.paga.moderateMinPerWeek) {
    out.push({
      id: "low-activity",
      text: `Prescribe a walking program starting at 10-minute bouts to reach the ${SSoT.paga.moderateMinPerWeek}-minute PAGA threshold.`,
    });
  }
  if (paga.sedentaryHr > SSoT.paga.sedentaryMaxHoursPerDay) {
    out.push({
      id: "high-sedentary",
      text: `Implement a "sit-stand" protocol or 5-minute movement breaks every hour.`,
    });
  }
  if (paga.resistanceDays < SSoT.paga.resistanceMinDaysPerWeek) {
    out.push({
      id: "low-resistance",
      text: `Introduce bodyweight or resistance band exercises targeting major muscle groups.`,
    });
  }
  return out;
}

export function AdimeNoteBuilder(p: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabKey>("A");
  const [assessment, setAssessment]     = usePersistentState(`${CDS_STORAGE_PREFIX}adime.A`, "");
  const [diagnosis, setDiagnosis]       = usePersistentState(`${CDS_STORAGE_PREFIX}adime.D`, "");
  const [intervention, setIntervention] = usePersistentState(`${CDS_STORAGE_PREFIX}adime.I`, "");
  const [monitoring, setMonitoring]     = usePersistentState(`${CDS_STORAGE_PREFIX}adime.M`, "");
  const [evaluation, setEvaluation]     = usePersistentState(`${CDS_STORAGE_PREFIX}adime.E`, "");
  const [copied, setCopied] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    if (p.openSignal && p.openSignal > 0) {
      setSuggestions(buildPagaSuggestions(p.paga));
      setTab(p.initialTab ?? "I");
      setOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.openSignal]);

  const ibwStatus = p.pctIBW ? ibwCategory(p.pctIBW) : "—";
  const fiberDeficit = p.recommendedFiber - p.fiberG;
  const adequate = isFiberAdequate(p.fiberG, p.recommendedFiber);

  const addSuggestion = (s: Suggestion) => {
    setIntervention(prev => (prev ? prev.replace(/\s+$/, "") + "\n" : "") + `• ${s.text}`);
    setSuggestions(prev => prev.filter(x => x.id !== s.id));
    toast.success("Suggestion added to Intervention");
  };

  const importedAssessment = useMemo(() => {
    return [
      `SUBJECTIVE / OBJECTIVE — imported from CDS modules`,
      ``,
      `Anthropometrics (Hamwi Method, SSoT):`,
      `  • Sex: ${p.sex}`,
      `  • Height: ${p.heightIn ? p.heightIn.toFixed(1) + " in" : "—"}`,
      `  • Actual Wt: ${p.actualLb ? p.actualLb.toFixed(1) + " lb" : "—"}`,
      `  • IBW: ${p.ibwLb ? p.ibwLb.toFixed(0) + " lb" : "—"}`,
      `  • % IBW: ${p.pctIBW ? p.pctIBW.toFixed(1) + "% (" + ibwStatus.toLowerCase() + ")" : "—"}`,
      ``,
      `Dietary Intake (DGA Audit, SSoT):`,
      `  • Energy: ${p.kcal ? p.kcal + " kcal/day" : "—"}`,
      `  • Fiber: ${p.fiberG ? p.fiberG.toFixed(1) + " g/day" : "—"}`,
      `  • Recommended Fiber: ${p.recommendedFiber ? p.recommendedFiber.toFixed(1) + " g/day" : "—"} (${SSoT.fiber.gramsPer1000Kcal} g/1000 kcal)`,
      `  • Adequacy: ${p.recommendedFiber ? (adequate ? "Adequate" : "Inadequate") : "—"}`,
    ].join("\n");
  }, [p, ibwStatus, adequate]);

  const generatedPES = useMemo(() => {
    if (!p.recommendedFiber || !p.fiberG) return "";
    if (adequate) {
      return `No fiber-related nutrition diagnosis at this time. Fiber intake meets DGA recommendation (${SSoT.fiber.gramsPer1000Kcal} g / 1000 kcal).`;
    }
    return `${SSoT.fiber.diagnosisLabel} (${SSoT.fiber.diagnosisCode}) related to limited intake of whole grains, fruits, vegetables, and legumes as evidenced by reported intake of ${p.fiberG.toFixed(1)} g/day vs. DGA-recommended ${p.recommendedFiber.toFixed(1)} g/day (deficit of ${fiberDeficit.toFixed(1)} g/day, ${((p.fiberG / p.recommendedFiber) * 100).toFixed(0)}% of goal).`;
  }, [p, adequate, fiberDeficit]);

  const importAssessment = () => {
    setAssessment(prev => (prev ? prev + "\n\n" : "") + importedAssessment);
    toast.success("Assessment data imported from Hamwi & Fiber modules");
  };

  const generatePES = () => {
    if (!generatedPES) {
      toast.error("Complete kcal & fiber inputs to generate a PES statement");
      return;
    }
    setDiagnosis(generatedPES);
    toast.success("PES statement pulled into Diagnosis field");
  };

  const compileNote = () => {
    const today = new Date().toISOString().slice(0, 10);
    const disclaimer =
`-----------------------------------------------------
DISCLAIMER: This ADIME note was generated by an
AI-enhanced Clinical Decision Support tool. All
calculations (Hamwi IBW, DGA fiber adequacy) must be
independently verified against the Single Source of
Truth (SSoT) references — Dietary Guidelines for
Americans & Hamwi Method — prior to clinical use.
The credentialed user (RDN/clinician) is solely
responsible for final verification, interpretation,
and documentation in the patient's medical record.
-----------------------------------------------------`;
    return [
      `ADIME NOTE  //  ${today}`,
      `=====================================================`,
      ``,
      `A — ASSESSMENT`,
      assessment || "  [empty]",
      ``,
      `D — DIAGNOSIS (PES)`,
      diagnosis || "  [empty]",
      ``,
      `I — INTERVENTION`,
      intervention || "  [empty]",
      ``,
      `M — MONITORING`,
      monitoring || "  [empty]",
      ``,
      `E — EVALUATION`,
      evaluation || "  [empty]",
      `=====================================================`,
      ``,
      disclaimer,
    ].join("\n");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(compileNote());
    setCopied(true);
    toast.success("Full ADIME note copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const goNext = () => {
    const idx = TABS.findIndex(t => t.key === tab);
    if (idx < TABS.length - 1) setTab(TABS[idx + 1].key);
  };
  const goPrev = () => {
    const idx = TABS.findIndex(t => t.key === tab);
    if (idx > 0) setTab(TABS[idx - 1].key);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-navy hover:bg-navy/90 text-creme font-mono text-xs font-bold h-11 px-5 rounded-sm">
          <FileText className="w-4 h-4 mr-2" />
          OPEN ADIME NOTE BUILDER
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-w-3xl w-[95vw] max-h-[92vh] overflow-y-auto bg-creme text-navy border-2 border-navy p-0"
        aria-labelledby="adime-builder-heading"
      >
        <DialogHeader className="bg-navy text-creme p-5 border-b-2 border-red space-y-2">
          <span className="inline-flex w-fit font-mono text-[10px] font-bold uppercase tracking-widest bg-red text-creme px-2 py-1 rounded-sm">
            ADIME / NOTE BUILDER
          </span>
          <DialogTitle id="adime-builder-heading" className="text-creme text-xl md:text-2xl font-extrabold">
            Multi-Step ADIME Note Builder
          </DialogTitle>
          <DialogDescription className="text-creme/85 font-mono text-xs">
            Complete each step. Use Import / Generate to pull SSoT-backed data into your note.
          </DialogDescription>
        </DialogHeader>

        <article className="p-5 md:p-6">
          <Tabs value={tab} onValueChange={v => setTab(v as TabKey)}>
            <TabsList className="grid grid-cols-6 w-full h-auto bg-navy/10 p-1 rounded-sm">
              {TABS.map(t => (
                <TabsTrigger
                  key={t.key}
                  value={t.key}
                  className="flex flex-col gap-0.5 py-2 font-mono text-xs font-bold uppercase
                             text-navy data-[state=active]:bg-navy data-[state=active]:text-creme rounded-sm"
                >
                  <span className="text-base">{t.label}</span>
                  <span className="hidden sm:inline text-[9px] tracking-widest">{t.full}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ASSESSMENT */}
            <TabsContent value="A" className="mt-5 space-y-3">
              <StepHeader title="Assessment" subtitle="Anthropometrics, biochemical, clinical, dietary, social history." />
              <Button
                onClick={importAssessment}
                className="bg-red hover:bg-red/90 text-creme font-mono text-xs font-bold h-10 rounded-sm"
              >
                <Download className="w-4 h-4 mr-1.5" />
                IMPORT DATA (HAMWI + FIBER)
              </Button>
              <Textarea
                value={assessment}
                onChange={e => setAssessment(e.target.value)}
                placeholder="Narrator: Document patient's nutrition-focused physical findings, anthropometric trends, lab values, food/nutrient intake, and pertinent psychosocial context. Use the Import button above to pre-populate validated CDS calculations."
                className="min-h-[260px] font-mono text-sm bg-card text-navy border-2 border-navy/30 focus-visible:border-navy placeholder:text-navy/55"
              />
            </TabsContent>

            {/* DIAGNOSIS */}
            <TabsContent value="D" className="mt-5 space-y-3">
              <StepHeader title="Diagnosis" subtitle="PES Statement — Problem related to Etiology as evidenced by Signs/Symptoms." />
              <PesGenerator
                fiberG={p.fiberG}
                recommendedFiber={p.recommendedFiber}
                paga={p.paga}
                onAccept={(s) => setDiagnosis(s)}
              />
              <Textarea
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                placeholder="Narrator: State the nutrition diagnosis using IDNT terminology. Format: [Problem] related to [Etiology] as evidenced by [Signs/Symptoms]. Use the generator above to auto-build a fiber-based PES statement from current Tier 02 data."
                className="min-h-[220px] font-mono text-sm bg-card text-navy border-2 border-navy/30 focus-visible:border-navy placeholder:text-navy/55"
              />
            </TabsContent>

            {/* INTERVENTION */}
            <TabsContent value="I" className="mt-5 space-y-3">
              <StepHeader title="Intervention" subtitle="Planned actions to resolve or improve the nutrition diagnosis." />
              <Textarea
                value={intervention}
                onChange={e => setIntervention(e.target.value)}
                placeholder="Narrator: Describe nutrition prescription, education topics (e.g., E-1.1 priority modifications), counseling strategy, and coordination of care. Specify measurable goals (e.g., 'Increase fiber to ≥X g/day over 4 weeks') and any referrals."
                className="min-h-[220px] font-mono text-sm bg-card text-navy border-2 border-navy/30 focus-visible:border-navy placeholder:text-navy/55"
              />

              <aside
                aria-labelledby="smart-suggestions-heading"
                className="bg-creme border-2 border-navy/40 rounded-sm p-4 mt-3"
              >
                <header className="mb-3">
                  <h4 id="smart-suggestions-heading" className="font-extrabold text-navy text-sm uppercase tracking-wide">
                    Clinical Recommendations
                  </h4>
                  <p className="font-mono text-[11px] text-navy/70 mt-1 italic">
                    Narrator: Based on the PAGA Audit, consider the following evidence-based interventions.
                  </p>
                </header>

                {suggestions.length === 0 ? (
                  <p className="font-mono text-xs text-navy/60">
                    // No outstanding PAGA-flagged suggestions. Run "Export to ADIME" from the PAGA Auditor to refresh.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {suggestions.map(s => (
                      <li key={s.id} className="flex items-start gap-2 bg-card border border-navy/20 rounded-sm p-2.5">
                        <p className="flex-1 font-mono text-xs text-navy leading-relaxed">{s.text}</p>
                        <Button
                          onClick={() => addSuggestion(s)}
                          aria-label={`Add suggestion: ${s.text}`}
                          className="bg-navy hover:bg-navy/90 text-creme h-8 w-8 p-0 rounded-sm shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </aside>
            </TabsContent>

            {/* MONITORING */}
            <TabsContent value="M" className="mt-5 space-y-3">
              <StepHeader title="Monitoring" subtitle="Indicators tracked between visits to measure progress." />
              <Textarea
                value={monitoring}
                onChange={e => setMonitoring(e.target.value)}
                placeholder="Narrator: List specific indicators to monitor (e.g., 24-hr recall fiber adequacy, weight trajectory, % IBW, hydration status, GI tolerance). Define frequency and method of follow-up (e.g., 2-week and 4-week check-ins)."
                className="min-h-[260px] font-mono text-sm bg-card text-navy border-2 border-navy/30 focus-visible:border-navy placeholder:text-navy/55"
              />
            </TabsContent>

            {/* EVALUATION */}
            <TabsContent value="E" className="mt-5 space-y-3">
              <StepHeader title="Evaluation" subtitle="Comparison of monitored indicators to established goals." />
              <Textarea
                value={evaluation}
                onChange={e => setEvaluation(e.target.value)}
                placeholder="Narrator: Compare current indicators against baseline and goals. Document progress (resolved, improving, no change, regressed) and rationale for continuing, modifying, or discontinuing the nutrition intervention."
                className="min-h-[220px] font-mono text-sm bg-card text-navy border-2 border-navy/30 focus-visible:border-navy placeholder:text-navy/55"
              />
            </TabsContent>

            {/* CLIENT EDUCATION */}
            <TabsContent value="C" className="mt-5">
              <ClientEducation
                fiberG={p.fiberG}
                recommendedFiber={p.recommendedFiber}
                paga={p.paga}
              />
            </TabsContent>
          </Tabs>

          <footer className="mt-6 pt-4 border-t-2 border-dashed border-navy/30 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <Button
                onClick={goPrev}
                disabled={tab === "A"}
                variant="outline"
                className="font-mono text-xs font-bold h-10 border-2 border-navy text-navy hover:bg-navy hover:text-creme rounded-sm disabled:opacity-40"
              >
                ← PREV
              </Button>
              <Button
                onClick={goNext}
                disabled={tab === "E"}
                variant="outline"
                className="font-mono text-xs font-bold h-10 border-2 border-navy text-navy hover:bg-navy hover:text-creme rounded-sm disabled:opacity-40"
              >
                NEXT →
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleCopy}
                className="bg-navy hover:bg-navy/90 text-creme font-mono text-xs font-bold h-10 px-4 rounded-sm"
              >
                {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
                {copied ? "COPIED FULL NOTE" : "COPY FULL ADIME NOTE"}
              </Button>
              <Button
                onClick={() => setOpen(false)}
                className="bg-red hover:bg-red/90 text-creme font-mono text-xs font-bold h-10 px-4 rounded-sm"
              >
                ✓ DONE — RETURN TO DASHBOARD
              </Button>
            </div>
          </footer>
        </article>
      </DialogContent>
    </Dialog>
  );
}

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header>
      <h3 className="text-lg md:text-xl font-extrabold text-navy">{title}</h3>
      <p className="font-mono text-[11px] uppercase tracking-widest text-navy/70 mt-1">{subtitle}</p>
    </header>
  );
}
