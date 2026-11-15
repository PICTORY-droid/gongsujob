import { Factory, HardHat, Package, Truck, UtensilsCrossed, Wrench, type LucideIcon } from "lucide-react";
import type { JobGroupKey } from "@/lib/job-taxonomy";

/** 직종 분야 아이콘 (Lucide, ISC). 홈 메뉴·필터·작성 폼이 같은 그림을 쓴다 */
export const JOB_GROUP_ICONS: Record<JobGroupKey, LucideIcon> = {
  site: HardHat,
  skilled: Wrench,
  logistics: Truck,
  moving: Package,
  restaurant: UtensilsCrossed,
  factory: Factory,
};

export function JobGroupIcon({ group, size = 24, strokeWidth = 1.9 }: { group: JobGroupKey; size?: number; strokeWidth?: number }) {
  const Icon = JOB_GROUP_ICONS[group];
  return <Icon size={size} strokeWidth={strokeWidth} aria-hidden="true" />;
}
