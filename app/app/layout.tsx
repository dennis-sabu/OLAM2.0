import Sidebar from "@/components/Sidebar";
import { FlowStateProvider } from "@/lib/FlowStateProvider";
import { FlowStateBLEProvider } from "@/lib/bluetooth/FlowStateBLEContext";
import { AuthGuard } from "@/lib/auth/AuthGuard";
import { AppErrorBanner } from "@/components/AppErrorBanner";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <FlowStateProvider>
        <FlowStateBLEProvider>
          <AppErrorBanner />
          <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <main className="flex-1 overflow-y-auto md:ml-64 p-6 md:p-10 relative">
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
               {children}
            </main>
          </div>
        </FlowStateBLEProvider>
      </FlowStateProvider>
    </AuthGuard>
  );
}
