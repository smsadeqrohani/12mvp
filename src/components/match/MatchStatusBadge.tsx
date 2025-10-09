import { Badge } from "../ui/Badge";

type MatchStatus = "waiting" | "active" | "completed" | "cancelled";

interface MatchStatusBadgeProps {
  status: MatchStatus;
}

const statusConfig: Record<
  MatchStatus,
  { variant: "success" | "warning" | "error" | "info"; text: string }
> = {
  waiting: { variant: "warning", text: "منتظر" },
  active: { variant: "info", text: "در حال انجام" },
  completed: { variant: "success", text: "تکمیل شده" },
  cancelled: { variant: "error", text: "لغو شده" },
};

export function MatchStatusBadge({ status }: MatchStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant} dot>
      {config.text}
    </Badge>
  );
}

