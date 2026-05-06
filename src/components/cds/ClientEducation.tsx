import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, Heart } from "lucide-react";
import { toast } from "sonner";
import { isFiberAdequate, SSoT } from "@/lib/clinicalStandards";
import type { PagaState } from "./PagaAuditor";

interface Props {
  fiberG: number;
  recommendedFiber: number;
  paga: PagaState;
}

interface Tip { id: string; text: string; }

export function ClientEducation({ fiberG, recommendedFiber, paga }: Props) {
  const [copied, setCopied] = useState(false);

  const tips = useMemo<Tip[]>(() => {
    const list: Tip[] = [];
    if (paga.activityMin < SSoT.paga.moderateMinPerWeek) {
      list.push({
        id: "activity",
        text: `Your activity levels are below the recommended ${SSoT.paga.moderateMinPerWeek} minutes for heart health. Try short 10-minute walks throughout your day — they add up quickly.`,
      });
    }
    if (paga.sedentaryHr > SSoT.paga.sedentaryMaxHoursPerDay) {
      list.push({
        id: "sedentary",
        text: `Long stretches of sitting can leave you feeling sluggish. Standing up and moving for 5 minutes every hour helps your energy and circulation.`,
      });
    }
    if (paga.resistanceDays < SSoT.paga.resistanceMinDaysPerWeek) {
      list.push({
        id: "resistance",
        text: `Adding 2 short strength sessions a week — using your body weight or light bands — helps protect your muscles and bones as you age.`,
      });
    }
    if (recommendedFiber > 0 && !isFiberAdequate(fiberG, recommendedFiber)) {
      list.push({
        id: "fiber",
        text: `Increasing fiber can help stabilize your energy throughout the day. Aim to add a fruit, vegetable, or whole grain to each meal.`,
      });
    }
    if (list.length === 0) {
      list.push({
        id: "great",
        text: `Great work — your activity and fiber numbers look healthy today. Keep up the consistent routine!`,
      });
    }
    return list;
  }, [paga, fiberG, recommendedFiber]);

  const summaryText = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return [
      `YOUR TAKE-HOME SUMMARY  //  ${today}`,
      `------------------------------------------`,
      ``,
      ...tips.map(t => `• ${t.text}`),
      ``,
      `Questions? Bring them to your next visit with your dietitian.`,
    ].join("\n");
  }, [tips]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summaryText);
    setCopied(true);
    toast.success("Client summary copied (plain language only)");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      aria-labelledby="client-ed-heading"
      aria-live="polite"
      className="space-y-4"
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 id="client-ed-heading" className="text-lg md:text-xl font-extrabold text-navy flex items-center gap-2">
            <Heart className="w-5 h-5 text-red" aria-hidden /> Client Education
          </h3>
          <p className="font-mono text-[11px] uppercase tracking-widest text-navy/70 mt-1">
            Plain-language take-homes — no clinical jargon.
          </p>
          <p className="font-mono text-[11px] text-navy/70 mt-2 italic">
            Narrator: These talking points translate the clinical findings into
            language your client can act on at home.
          </p>
        </div>
        <Button
          onClick={handleCopy}
          className="bg-red hover:bg-red/90 text-creme font-mono text-xs font-bold h-10 px-4 rounded-sm shrink-0"
        >
          {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
          {copied ? "COPIED" : "COPY CLIENT SUMMARY"}
        </Button>
      </header>

      <ul className="space-y-2.5">
        {tips.map(t => (
          <li
            key={t.id}
            className="bg-creme border-2 border-navy/40 rounded-sm p-3.5 text-navy text-sm leading-relaxed"
          >
            {t.text}
          </li>
        ))}
      </ul>

      <footer className="pt-3 border-t-2 border-dashed border-navy/30">
        <p className="font-mono text-[10px] uppercase tracking-widest text-navy/60">
          // Auto-updates from the Assessment & PAGA Auditor inputs.
        </p>
      </footer>
    </section>
  );
}
