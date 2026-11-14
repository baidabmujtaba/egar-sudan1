import { Briefcase, Home, ShieldCheck, User } from "lucide-react";

interface Props {
  full_name?: string | null;
  role?: string | null;
  className?: string;
}

const ROLE_MAP: Record<string, { label: string; icon: typeof User; classes: string }> = {
  broker: {
    label: "وسيط",
    icon: Briefcase,
    classes: "bg-secondary text-secondary-foreground ring-border",
  },
  owner: {
    label: "المالك",
    icon: Home,
    classes: "bg-success/10 text-success ring-success/25",
  },
  admin: {
    label: "مشرف",
    icon: ShieldCheck,
    classes: "bg-primary/10 text-primary ring-primary/25",
  },
  tenant: {
    label: "مستأجر",
    icon: User,
    classes: "bg-muted text-muted-foreground ring-border",
  },
};

function initials(name?: string | null) {
  const n = (name || "").trim();
  if (!n) return "؟";
  const parts = n.split(/\s+/);
  return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
}

export default function AdvertiserTag({ full_name, role, className = "" }: Props) {
  const meta = ROLE_MAP[role || "tenant"] || ROLE_MAP.tenant;
  const Icon = meta.icon;

  return (
    <div className={`flex items-center gap-2 rounded-full bg-card/60 ring-1 ring-border px-2 py-1 ${className}`}>
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
        {initials(full_name)}
      </span>
      <span className="truncate text-xs font-medium text-foreground max-w-[45%] sm:max-w-[55%]">
        {full_name || "معلن"}
      </span>
      <span className={`mr-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${meta.classes}`}>
        <Icon className="h-3 w-3" />
        {meta.label}
      </span>
    </div>
  );
}
