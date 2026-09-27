"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  CheckSquare, 
  CalendarDays, 
  Activity, 
  BarChart3, 
  Settings,
  BrainCircuit,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";

const navigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
  { name: 'Tasks', href: '/app/tasks', icon: CheckSquare },
  { name: 'Adaptive Planner', href: '/app/planner', icon: CalendarDays },
  { name: 'Daily State', href: '/app/state', icon: Activity },
  { name: 'Insights', href: '/app/insights', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/sign-in");
  };

  return (
    <>
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2 glass-card rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#0a0a0c] border-r border-white/5 flex flex-col
        transition-transform duration-300 ease-in-out md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center gap-2">
           <BrainCircuit className="w-6 h-6 text-primary" />
           <span className="font-display text-xl font-bold tracking-tight text-white">FlowState</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg font-ui text-sm transition-all
                  ${isActive 
                    ? 'bg-primary/10 text-primary glow-primary font-medium' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'}
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 space-y-2">
          <Link
            href="/app/settings"
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg font-ui text-sm transition-all
              ${pathname === '/app/settings' 
                ? 'bg-primary/10 text-primary glow-primary font-medium' 
                : 'text-white/60 hover:text-white hover:bg-white/5'}
            `}
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-ui text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
