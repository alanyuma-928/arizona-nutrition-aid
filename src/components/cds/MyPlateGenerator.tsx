import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { SSoT, recommendedFiberG } from "@/lib/clinicalStandards";
import { Plus, Utensils } from "lucide-react";
import { toast } from "sonner";

type Tier = typeof SSoT.myPlate.tiers[number];
type PlanLength = 1 | 5 | 7;

interface Props {
  kcal: number;
  onExport: (text: string) => void;
}

interface Meal { meal: string; food: string; groups: string; }

function nearestTier(kcal: number): Tier {
  return SSoT.myPlate.tiers.reduce((best, t) =>
    Math.abs(t.kcal - kcal) < Math.abs(best.kcal - kcal) ? t : best
  , SSoT.myPlate.tiers[0]);
}

const ROTATION: Meal[][] = [
  [
    { meal: "Breakfast", food: "Oatmeal w/ berries & walnuts, milk", groups: "Grain, Fruit, Protein, Dairy" },
    { meal: "Lunch",     food: "Turkey & spinach wrap, baby carrots, apple", groups: "Grain, Veg, Protein, Fruit" },
    { meal: "Dinner",    food: "Grilled chicken, brown rice, broccoli, side salad", groups: "Protein, Grain, Veg" },
    { meal: "Snack",     food: "Greek yogurt + chia seeds", groups: "Dairy, Protein" },
  ],
  [
    { meal: "Breakfast", food: "Whole-grain toast, scrambled eggs, orange", groups: "Grain, Protein, Fruit" },
    { meal: "Lunch",     food: "Lentil soup, mixed greens salad, whole-grain roll", groups: "Protein, Veg, Grain" },
    { meal: "Dinner",    food: "Baked salmon, quinoa, roasted Brussels sprouts", groups: "Protein, Grain, Veg" },
    { meal: "Snack",     food: "Cottage cheese + pear", groups: "Dairy, Fruit" },
  ],
  [
    { meal: "Breakfast", food: "Smoothie: spinach, banana, milk, peanut butter, oats", groups: "Veg, Fruit, Dairy, Protein, Grain" },
    { meal: "Lunch",     food: "Black bean & corn bowl, brown rice, salsa, avocado", groups: "Protein, Veg, Grain" },
    { meal: "Dinner",    food: "Stir-fried tofu, mixed peppers, soba noodles", groups: "Protein, Veg, Grain" },
    { meal: "Snack",     food: "Hummus + cucumber + whole-grain crackers", groups: "Protein, Veg, Grain" },
  ],
  [
    { meal: "Breakfast", food: "Greek yogurt parfait w/ granola & strawberries", groups: "Dairy, Grain, Fruit" },
    { meal: "Lunch",     food: "Tuna salad on whole-grain bread, tomato slices, grapes", groups: "Protein, Grain, Veg, Fruit" },
    { meal: "Dinner",    food: "Turkey chili w/ kidney beans, cornbread, side salad", groups: "Protein, Grain, Veg" },
    { meal: "Snack",     food: "Almonds + apple slices", groups: "Protein, Fruit" },
  ],
  [
    { meal: "Breakfast", food: "Veggie omelet, whole-wheat English muffin, melon", groups: "Protein, Veg, Grain, Fruit" },
    { meal: "Lunch",     food: "Chickpea Mediterranean salad, pita, feta", groups: "Protein, Veg, Grain, Dairy" },
    { meal: "Dinner",    food: "Lean beef stir-fry, brown rice, bok choy", groups: "Protein, Grain, Veg" },
    { meal: "Snack",     food: "Pear + string cheese", groups: "Fruit, Dairy" },
  ],
  [
    { meal: "Breakfast", food: "Whole-grain pancakes w/ blueberries, milk", groups: "Grain, Fruit, Dairy" },
    { meal: "Lunch",     food: "Grilled chicken Caesar (romaine), whole-grain croutons", groups: "Protein, Veg, Grain, Dairy" },
    { meal: "Dinner",    food: "Baked cod, sweet potato, sautéed kale", groups: "Protein, Veg" },
    { meal: "Snack",     food: "Edamame + clementine", groups: "Protein, Fruit" },
  ],
  [
    { meal: "Breakfast", food: "Bran cereal w/ milk, banana, walnuts", groups: "Grain, Dairy, Fruit, Protein" },
    { meal: "Lunch",     food: "Quinoa power bowl: kale, chickpeas, roasted veg", groups: "Grain, Veg, Protein" },
    { meal: "Dinner",    food: "Whole-wheat pasta primavera w/ shrimp", groups: "Grain, Veg, Protein" },
    { meal: "Snack",     food: "Yogurt + raspberries", groups: "Dairy, Fruit" },
  ],
];

export function MyPlateGenerator({ kcal, onExport }: Props) {
  const [length, setLength] = useState<PlanLength>(1);
  const tier = useMemo(() => nearestTier(kcal || 2000), [kcal]);
  const fiberGoal = useMemo(() => recommendedFiberG(tier.kcal), [tier]);

  const days = useMemo(() => {
    const out: { day: number; meals: Meal[] }[] = [];
    for (let i = 0; i < length; i++) {
      out.push({ day: i + 1, meals: ROTATION[i % (length === 5 ? 5 : ROTATION.length)] });
    }
    return out;
  }, [length]);

  const summary = useMemo(() => {
    const lines: string[] = [];
    lines.push(`MYPLATE MEAL PLAN — ${length}-day · ${tier.kcal} kcal/day tier`);
    lines.push(`USDA Daily Targets: ${tier.vegCups} c veg · ${tier.fruitCups} c fruit · ${tier.grainsOz} oz grains · ${tier.proteinOz} oz protein · ${tier.dairyCups} c dairy`);
    lines.push(`Fiber goal (DGA 14g/1000 kcal): ≥ ${fiberGoal.toFixed(1)} g/day`);
    lines.push("");
    days.forEach(d => {
      lines.push(`Day ${d.day}:`);
      d.meals.forEach(m => lines.push(`  • ${m.meal}: ${m.food}`));
    });
    return lines.join("\n");
  }, [days, length, tier, fiberGoal]);

  const segs = SSoT.myPlate.platePercents;

  return (
    <section
      aria-labelledby="myplate-heading"
      className="bg-creme border-2 border-navy/40 rounded-sm p-4 mt-4 space-y-4"
    >
      <header>
        <h4 id="myplate-heading" className="font-extrabold text-navy text-sm uppercase tracking-wide flex items-center gap-2">
          <Utensils className="w-4 h-4" /> MyPlate Meal Plan Generator
        </h4>
        <p className="font-mono text-[11px] text-navy/70 mt-1 italic">
          Narrator: These plans are based on USDA standards and are designed to solve the nutrition gaps identified in your assessment.
        </p>
      </header>

      {/* Plan length selector */}
      <div role="radiogroup" aria-label="Plan length" className="flex gap-2">
        {([1, 5, 7] as PlanLength[]).map(n => (
          <Button
            key={n}
            role="radio"
            aria-checked={length === n}
            onClick={() => setLength(n)}
            className={`font-mono text-xs font-bold h-9 px-3 rounded-sm border-2 ${
              length === n
                ? "bg-navy text-creme border-navy"
                : "bg-card text-navy border-navy/40 hover:bg-navy hover:text-creme"
            }`}
          >
            {n}-DAY
          </Button>
        ))}
      </div>

      {/* Digital plate + targets */}
      <div className="grid sm:grid-cols-[160px_1fr] gap-4 items-center">
        <figure
          aria-label={`Digital plate for ${tier.kcal} kcal tier`}
          className="mx-auto"
          style={{
            width: 150,
            height: 150,
            borderRadius: "50%",
            border: "4px solid hsl(var(--navy))",
            background: `conic-gradient(
              hsl(var(--navy)) 0 ${segs.veg}%,
              hsl(var(--red)) ${segs.veg}% ${segs.veg + segs.fruit}%,
              hsl(var(--creme-foreground, var(--navy))) ${segs.veg + segs.fruit}% ${segs.veg + segs.fruit + segs.grains}%,
              hsl(var(--red) / 0.6) ${segs.veg + segs.fruit + segs.grains}% 100%
            )`,
            boxShadow: "0 0 0 8px hsl(var(--creme))",
          }}
        />
        <dl className="font-mono text-xs text-navy grid grid-cols-2 gap-y-1">
          <dt className="font-bold">Tier</dt><dd>{tier.kcal} kcal/day</dd>
          <dt className="font-bold">Vegetables</dt><dd>{tier.vegCups} cups</dd>
          <dt className="font-bold">Fruit</dt><dd>{tier.fruitCups} cups</dd>
          <dt className="font-bold">Grains</dt><dd>{tier.grainsOz} oz</dd>
          <dt className="font-bold">Protein</dt><dd>{tier.proteinOz} oz</dd>
          <dt className="font-bold">Dairy</dt><dd>{tier.dairyCups} cups</dd>
          <dt className="font-bold">Fiber goal</dt><dd>≥ {fiberGoal.toFixed(1)} g/day</dd>
        </dl>
      </div>

      {/* Meal tables */}
      <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
        {days.map(d => (
          <table
            key={d.day}
            className="w-full text-left border-2 border-navy/30 bg-card"
          >
            <caption className="font-mono text-[11px] uppercase tracking-widest text-navy/80 text-left py-1 font-bold">
              Day {d.day}
            </caption>
            <thead className="bg-navy text-creme">
              <tr>
                <th scope="col" className="font-mono text-[10px] uppercase tracking-wider px-2 py-1.5 w-24">Meal</th>
                <th scope="col" className="font-mono text-[10px] uppercase tracking-wider px-2 py-1.5">Food</th>
                <th scope="col" className="font-mono text-[10px] uppercase tracking-wider px-2 py-1.5 hidden md:table-cell">Groups</th>
              </tr>
            </thead>
            <tbody>
              {d.meals.map((m, i) => (
                <tr key={i} className="border-t border-navy/15">
                  <th scope="row" className="font-mono text-xs font-bold text-navy px-2 py-1.5 align-top">{m.meal}</th>
                  <td className="font-mono text-xs text-navy px-2 py-1.5">{m.food}</td>
                  <td className="font-mono text-[11px] text-navy/70 px-2 py-1.5 hidden md:table-cell">{m.groups}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>

      <Button
        onClick={() => { onExport(summary); toast.success("Meal plan exported to Intervention"); }}
        className="bg-red hover:bg-red/90 text-creme font-mono text-xs font-bold h-10 px-4 rounded-sm"
      >
        <Plus className="w-4 h-4 mr-1.5" />
        EXPORT MEAL PLAN TO INTERVENTION
      </Button>
    </section>
  );
}
