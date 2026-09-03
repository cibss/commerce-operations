export type ProgressStepState = "complete" | "current" | "upcoming" | "error";

export type ProgressStep = {
  label: string;
  state: ProgressStepState;
};

type ProgressStepsProps = {
  steps: ProgressStep[];
};

export function ProgressSteps({ steps }: ProgressStepsProps) {
  return (
    <div className="flex min-w-max items-start">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        const circleStyles = {
          complete: "border-indigo-600 bg-indigo-600 text-white",
          current:
            "border-indigo-600 bg-white text-indigo-600 ring-4 ring-indigo-50",
          upcoming: "border-slate-200 bg-white text-slate-400",
          error: "border-rose-500 bg-rose-500 text-white",
        }[step.state];

        const lineComplete = step.state === "complete";

        return (
          <div key={step.label} className={`flex ${isLast ? "" : "flex-1"}`}>
            <div className="flex flex-col items-center">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-bold ${circleStyles}`}
              >
                {step.state === "complete" ? "✓" : index + 1}
              </div>

              <span className="mt-2 max-w-24 text-center text-[11px] font-medium text-slate-600">
                {step.label}
              </span>
            </div>

            {!isLast ? (
              <div
                className={`mx-3 mt-3 h-0.5 min-w-8 flex-1 ${
                  lineComplete ? "bg-indigo-400" : "bg-slate-200"
                }`}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
