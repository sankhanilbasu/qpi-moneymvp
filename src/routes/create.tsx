import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Card } from "@/components/AppShell";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create — QPi.money" },
      { name: "description", content: "Set up your storefront and create offers." },
      { property: "og:title", content: "Create — QPi.money" },
      { property: "og:description", content: "Set up your storefront and create offers." },
    ],
  }),
  component: Create,
});

const steps = ["Storefront", "Offer", "Terms", "Review"];

function Create() {
  const [step, setStep] = useState(0);
  return (
    <AppShell title="Create">
      <div className="mb-5 flex gap-1.5">
        {steps.map((s, i) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Step {step + 1} of {steps.length}</p>
      <h2 className="mb-4 text-xl font-semibold">{steps[step]}</h2>
      <Card className="flex flex-col gap-3">
        <input placeholder={`${steps[step]} name`} className="rounded-lg bg-muted px-3 py-2.5 text-sm outline-none" />
        <textarea placeholder="Description" rows={4} className="rounded-lg bg-muted px-3 py-2.5 text-sm outline-none" />
      </Card>
      <div className="mt-5 flex gap-3">
        <button disabled={step === 0} onClick={() => setStep(step - 1)} className="flex-1 rounded-xl border border-border py-3 font-medium disabled:opacity-40">
          Back
        </button>
        <button onClick={() => setStep(Math.min(step + 1, steps.length - 1))} className="flex-1 rounded-xl bg-primary py-3 font-semibold text-primary-foreground">
          {step === steps.length - 1 ? "Publish" : "Next"}
        </button>
      </div>
    </AppShell>
  );
}
