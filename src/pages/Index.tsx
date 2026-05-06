import { useMemo, useState } from "react";
import { AssessmentBox, Sex, Unit } from "@/components/cds/AssessmentBox";
import { NutrientAuditor } from "@/components/cds/NutrientAuditor";
import { AdimeBox } from "@/components/cds/AdimeBox";
import { AdimeNoteBuilder } from "@/components/cds/AdimeNoteBuilder";
import { PagaAuditor, PagaState } from "@/components/cds/PagaAuditor";
import { UserGuide } from "@/components/cds/UserGuide";
import { hamwiIbwLb, recommendedFiberG } from "@/lib/clinicalStandards";
import { usePersistentState, CDS_STORAGE_PREFIX, clearCdsStorage } from "@/lib/usePersistentState";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [unit, setUnit]         = usePersistentState<Unit>(`${CDS_STORAGE_PREFIX}unit`, "imperial");
  const [sex, setSex]           = usePersistentState<Sex>(`${CDS_STORAGE_PREFIX}sex`, "female");
  const [heightIn, setHeightIn] = usePersistentState<number>(`${CDS_STORAGE_PREFIX}heightIn`, 65);
  const [actualLb, setActualLb] = usePersistentState<number>(`${CDS_STORAGE_PREFIX}actualLb`, 140);
  const [kcal, setKcal]         = usePersistentState<number>(`${CDS_STORAGE_PREFIX}kcal`, 2000);
  const [fiberG, setFiberG]     = usePersistentState<number>(`${CDS_STORAGE_PREFIX}fiberG`, 15);
  const [paga, setPaga]         = usePersistentState<PagaState>(`${CDS_STORAGE_PREFIX}paga`, {
    activityMin: 90,
    sedentaryHr: 10,
    resistanceDays: 1,
  });
  const [adimeOpenSignal, setAdimeOpenSignal] = useState(0);

  const handleClearAll = () => {
    if (!window.confirm("Clear ALL clinical session data from this browser? This cannot be undone.")) return;
    clearCdsStorage();
    toast.success("Session cleared. Reloading...");
    setTimeout(() => window.location.reload(), 400);
  };

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
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex font-mono text-[10px] font-bold uppercase
                             tracking-widest bg-red text-creme px-2 py-1 rounded-sm">
              v1.0 / CDS
            </span>
            <UserGuide />
          </div>
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

        <footer className="pt-4 pb-8 flex flex-col items-center gap-3">
          <Button
            onClick={handleClearAll}
            variant="outline"
            className="font-mono text-xs font-bold h-9 px-3 border-2 border-red text-red hover:bg-red hover:text-creme rounded-sm"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            CLEAR ALL DATA
          </Button>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-center">
            // Session auto-saved to this browser · For educational use · Not a substitute for clinical judgment
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
