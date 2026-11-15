import { Briefcase, ClipboardList, FileText, Heart, House, LogIn, MessageCircle, SquarePlus, UserRound, Users, type LucideIcon } from "lucide-react";
import type { NavIcon as NavIconName } from "@/lib/navigation";

/** 메뉴 아이콘 (Lucide, ISC 라이선스). 운영체제마다 모양이 달라지던 이모지 아이콘을 대체 */
const ICONS: Record<NavIconName, LucideIcon> = {
  home: House,
  jobs: Briefcase,
  saved: Heart,
  resume: FileText,
  me: UserRound,
  talent: Users,
  post: SquarePlus,
  manage: ClipboardList,
  contact: MessageCircle,
  login: LogIn,
};

export function NavIcon({ name, size = 22, active = false }: { name: NavIconName; size?: number; active?: boolean }) {
  const Icon = ICONS[name];
  return <Icon size={size} strokeWidth={active ? 2.4 : 1.8} aria-hidden="true" />;
}
