import { ApprovalStep, APPROVAL_STAGES_BRANCH } from "@/types/budget";
import { Check, Clock, AlertCircle, X } from "lucide-react";

interface Props {
  approvalChain: ApprovalStep[];
  stages: { stage: string; label: string }[];
}

export default function ApprovalTimeline({ approvalChain, stages }: Props) {
  const getStepStatus = (stage: string) => {
    const step = approvalChain.find(s => s.stage === stage);
    if (!step) return "upcoming";
    if (step.action === "approved") return "approved";
    if (step.action === "revision_requested") return "revision";
    if (step.action === "rejected") return "rejected";
    return "current";
  };

  const getStepData = (stage: string) => {
    return approvalChain.find(s => s.stage === stage);
  };

  return (
    <div className="space-y-0">
      {stages.map((s, i) => {
        const status = getStepStatus(s.stage);
        const data = getStepData(s.stage);
        const isLast = i === stages.length - 1;

        return (
          <div key={s.stage} className="flex gap-3">
            {/* Timeline line + icon */}
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                status === "approved" ? "bg-success text-success-foreground" :
                status === "revision" ? "bg-accent text-accent-foreground" :
                status === "rejected" ? "bg-destructive text-destructive-foreground" :
                status === "current" ? "bg-warning text-warning-foreground ring-4 ring-warning/20" :
                "bg-muted text-muted-foreground"
              }`}>
                {status === "approved" && <Check className="w-3.5 h-3.5" />}
                {status === "revision" && <AlertCircle className="w-3.5 h-3.5" />}
                {status === "rejected" && <X className="w-3.5 h-3.5" />}
                {status === "current" && <Clock className="w-3.5 h-3.5" />}
                {status === "upcoming" && <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />}
              </div>
              {!isLast && (
                <div className={`w-0.5 h-8 ${
                  status === "approved" ? "bg-success/30" : "bg-border"
                }`} />
              )}
            </div>

            {/* Content */}
            <div className="pb-6 min-w-0">
              <p className={`text-sm font-medium ${
                status === "upcoming" ? "text-muted-foreground" : "text-foreground"
              }`}>
                {s.label}
              </p>
              {data?.approvedBy && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {data.approvedBy} · {data.approvedAt}
                </p>
              )}
              {data?.comment && (
                <p className="text-xs text-accent mt-1 italic">"{data.comment}"</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
