import { useMemo, useState } from "react";
import { AssessmentBox, Sex, Unit } from "@/components/cds/AssessmentBox";
import { NutrientAuditor } from "@/components/cds/NutrientAuditor";
import { AdimeBox } from "@/components/cds/AdimeBox";
import { AdimeNoteBuilder } from "@/components/cds/AdimeNoteBuilder";
import { PagaAuditor, PagaState } from "@/components/cds/PagaAuditor";
import { hamwiIbwLb, recommendedFiberG } from "@/lib/clinicalStandards";

const Index = () => {
  const [unit, setUnit] = useState<Unit>("imperial");
  const [sex, setSex] = useState<Sex>("female");
  const [heightIn, setHeightIn] = useState(65);
  const [actualLb, setActualLb] = useState(140);
  const [kcal, setKcal] = useState(2000);
  const [fiberG, setFiberG] = useState(15);
  const [paga, setPaga] = useState<PagaState>({
    activityMin: 90,
    sedentaryHr: 10,
    resistanceDays: 1,
  });
  const [adimeOpenSignal, setAdimeOpenSignal] = useState(0);

  const ibwLb = useMemo(() => hamwiIbwLb(sex, heightIn), [heightIn, sex]);
  const pctIBW = ibwLb && actualLb ? (actualLb / ibwLb) * 100 : 0;
  const recommendedFiber = useMemo(() => recommendedFiberG(kcal), [kcal]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-2 border-navy bg-creme">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-navy text-creme grid place-items-center font-mono font-bold text-lg rounded-sm shrink-0">
            UA
          </div>
          <div className="flex-1 min-w-0">
            <p className="label-mono">Nutritional Sciences & Wellness Foods Lab</p>
            <h1 className="text-lg md:text-2xl font-extrabold text-navy leading-tight truncate">
              Clinical Decision Support
            </h1>
          </div>
          <span className="hidden sm:inline-flex font-mono text-[10px] font-bold uppercase
                           tracking-widest bg-red text-creme px-2 py-1 rounded-sm">
            v1.0 / CDS
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-5 md:space-y-6">
        <AssessmentBox
          sex={sex} setSex={setSex}
          unit={unit} setUnit={setUnit}
          heightIn={heightIn} setHeightIn={setHeightIn}
          actualLb={actualLb} setActualLb={setActualLb}
        />
        <NutrientAuditor
          kcal={kcal} setKcal={setKcal}
          fiberG={fiberG} setFiberG={setFiberG}
        />
        <PagaAuditor
          paga={paga} setPaga={setPaga}
          onExport={() => setAdimeOpenSignal(s => s + 1)}
        />
        <AdimeBox
          sex={sex}
          heightIn={heightIn}
          actualLb={actualLb}
          ibwLb={ibwLb}
          pctIBW={pctIBW}
          kcal={kcal}
          fiberG={fiberG}
          recommendedFiber={recommendedFiber}
        />

        <div className="flex justify-center pt-2">
          <AdimeNoteBuilder
            sex={sex}
            heightIn={heightIn}
            actualLb={actualLb}
            ibwLb={ibwLb}
            pctIBW={pctIBW}
            kcal={kcal}
            fiberG={fiberG}
            recommendedFiber={recommendedFiber}
            paga={paga}
            openSignal={adimeOpenSignal}
            initialTab="I"
          />
        </div>

        <footer className="pt-4 pb-8 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            // For educational use · Not a substitute for clinical judgment
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
