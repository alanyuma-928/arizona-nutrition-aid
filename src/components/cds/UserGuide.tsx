import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

export function UserGuide() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="user-guide-panel"
        aria-label="Open user guide"
        variant="outline"
        className="h-9 px-2.5 sm:px-3 border-2 border-navy text-navy hover:bg-navy hover:text-creme rounded-sm font-mono text-xs font-bold"
      >
        <HelpCircle className="w-4 h-4 sm:mr-1.5" aria-hidden />
        <span className="hidden sm:inline">USER GUIDE</span>
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          id="user-guide-panel"
          role="complementary"
          aria-label="User Guide"
          side="right"
          className="bg-creme text-navy border-l-4 border-red w-full sm:max-w-md overflow-y-auto p-0"
        >
          <SheetHeader className="bg-navy text-creme p-5 border-b-2 border-red space-y-2 text-left">
            <span className="inline-flex w-fit font-mono text-[10px] font-bold uppercase tracking-widest bg-red text-creme px-2 py-1 rounded-sm">
              USER GUIDE / NARRATOR
            </span>
            <SheetTitle className="text-creme text-xl md:text-2xl font-extrabold">
              How This App Helps You
            </SheetTitle>
            <SheetDescription className="text-creme/85 font-mono text-xs">
              A short, plain-language tour.
            </SheetDescription>
          </SheetHeader>

          <article className="p-5 md:p-6 space-y-6 text-[15px] leading-relaxed">
            <section aria-labelledby="ug-what">
              <h2 id="ug-what" className="text-lg font-extrabold text-navy mb-2">
                What is this?
              </h2>
              <p>
                This is a helper tool for doctors, dietitians, and health coaches.
                It does the math for you and turns it into a clear note you can
                share with your patient.
              </p>
            </section>

            <section aria-labelledby="ug-plan">
              <h2 id="ug-plan" className="text-lg font-extrabold text-navy mb-2">
                The 3-Step Plan
              </h2>
              <p className="mb-2">We follow the same simple loop every time:</p>
              <ul className="space-y-2 list-none pl-0">
                <li className="bg-card border-2 border-navy/30 rounded-sm p-3">
                  <strong className="text-navy">1. See what's happening.</strong>
                  <p className="mt-1">Type in the patient's height, weight, food, and activity.</p>
                </li>
                <li className="bg-card border-2 border-navy/30 rounded-sm p-3">
                  <strong className="text-navy">2. Check the health laws.</strong>
                  <p className="mt-1">
                    The app checks your numbers against the official rules
                    (Hamwi, DGA, and PAGA).
                  </p>
                </li>
                <li className="bg-card border-2 border-navy/30 rounded-sm p-3">
                  <strong className="text-navy">3. Make a plan.</strong>
                  <p className="mt-1">
                    The app builds an ADIME note and a friendly summary you can
                    give to the patient.
                  </p>
                </li>
              </ul>
            </section>

            <section aria-labelledby="ug-colors">
              <h2 id="ug-colors" className="text-lg font-extrabold text-navy mb-2">
                The Colors
              </h2>
              <ul className="space-y-2 list-none pl-0">
                <li className="flex items-start gap-3 bg-card border-2 border-navy/30 rounded-sm p-3">
                  <span className="w-5 h-5 rounded-sm bg-navy mt-0.5 shrink-0" aria-hidden />
                  <p>
                    <strong className="text-navy">Navy = Safe / Goal.</strong>{" "}
                    The patient is in a healthy range or meeting the target.
                  </p>
                </li>
                <li className="flex items-start gap-3 bg-card border-2 border-red/40 rounded-sm p-3">
                  <span className="w-5 h-5 rounded-sm bg-red mt-0.5 shrink-0" aria-hidden />
                  <p>
                    <strong className="text-red">Red = Needs Attention.</strong>{" "}
                    Something is outside the safe range. Take a closer look.
                  </p>
                </li>
              </ul>
            </section>

            <section aria-labelledby="ug-tips">
              <h2 id="ug-tips" className="text-lg font-extrabold text-navy mb-2">
                Tips
              </h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Your work is saved on this device automatically.</li>
                <li>The "Clear All Data" button starts a fresh session.</li>
                <li>Always double-check results before sharing them.</li>
              </ul>
            </section>

            <footer className="pt-4 border-t-2 border-dashed border-navy/30">
              <p className="font-mono text-[10px] uppercase tracking-widest text-navy/60">
                // For educational use · Verify against the SSoT before clinical action.
              </p>
            </footer>
          </article>
        </SheetContent>
      </Sheet>
    </>
  );
}
