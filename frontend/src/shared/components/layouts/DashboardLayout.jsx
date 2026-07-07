import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { useNotificationStore } from "@/store/notificationStore";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import Header from "../Header";

const TOAST_ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
};

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const notifications = useNotificationStore((state) => state.notifications);
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  const noPaddingPages = ["/dashboard/basic-chat", "/dashboard/docs"];

  return (
    <SidebarProvider defaultOpen={true} className="min-h-0 h-svh">
      <TooltipProvider>
        <AppSidebar />
      </TooltipProvider>

      <main data-slot="sidebar-inset" className="relative flex w-full flex-1 flex-col min-h-0 overflow-hidden bg-background md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2">
        {/* Toast notifications */}
        <div className="fixed top-4 right-4 z-[80] flex w-[min(92vw,380px)] flex-col gap-2">
          {notifications.map((n) => {
            const ToastIcon = TOAST_ICONS[n.type] || Info;
            return (
              <div
                key={n.id}
                className={`rounded-lg border px-3 py-2 shadow-lg backdrop-blur-sm ${n.type === "success" ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400" : n.type === "error" ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400" : n.type === "warning" ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400" : "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"}`}
              >
                <div className="flex items-start gap-2">
                  <ToastIcon size={18} className="shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    {n.title ? <p className="text-xs font-semibold mb-0.5">{n.title}</p> : null}
                    <p className="text-xs whitespace-pre-wrap break-words">{n.message}</p>
                  </div>
                  {n.dismissible ? (
                    <button
                      type="button"
                      onClick={() => removeNotification(n.id)}
                      className="text-current/70 hover:text-current"
                      aria-label="Dismiss notification"
                    >
                      <X size={16} />
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <Header />
        <div className={`flex-1 overflow-y-auto custom-scrollbar min-h-0 ${noPaddingPages.includes(pathname) ? "" : "p-6 lg:p-10"} ${noPaddingPages.includes(pathname) ? "flex flex-col" : ""}`}>
          <div className={`${noPaddingPages.includes(pathname) ? "flex-1 w-full h-full flex flex-col" : "max-w-7xl mx-auto"}`}>
            <Outlet />
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}
