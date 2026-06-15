import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Calendar,
  Inbox,
  LayoutDashboard,
  Megaphone,
  Settings,
  Star,
  UserPlus,
  Users,
} from "lucide-react";
import type { UserRole } from "@/lib/auth/types";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
};

export const DASHBOARD_NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    roles: ["admin", "user"],
  },
  {
    href: "/dashboard/reviews",
    label: "Reviews",
    icon: Star,
    roles: ["admin", "user"],
  },
  {
    href: "/dashboard/referrals",
    label: "Referrals",
    icon: UserPlus,
    roles: ["admin", "user"],
  },
  {
    href: "/dashboard/campaigns",
    label: "Campaigns",
    icon: Megaphone,
    roles: ["admin"],
  },
  {
    href: "/dashboard/contacts",
    label: "Contacts",
    icon: Users,
    roles: ["admin"],
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: BarChart3,
    roles: ["admin"],
  },
  {
    href: "/dashboard/inbox",
    label: "Inbox",
    icon: Inbox,
    roles: ["admin"],
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    roles: ["admin", "user"],
  },
];

export function getNavForRole(role: UserRole): NavItem[] {
  return DASHBOARD_NAV.filter((item) => item.roles.includes(role));
}
