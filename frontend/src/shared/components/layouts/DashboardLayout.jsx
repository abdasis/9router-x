import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { useNotificationStore } from "@/store/notificationStore";
import Header from "../Header";

function getToastStyle(type) {
  if (type === "success") {
    return {
      wrapper: "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400",
      icon: "check_circle",
    };
  }
  if (type === "error") {
    return {
      wrapper: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
      icon: "error",
    };
  }
  if (type === "warning") {
    return {
      wrapper: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
      icon: "warning",
    };
  }
  return {
    wrapper: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    icon: "info",
  };
}

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const notifications = useNotificationStore((state) => state.notifications);
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  const noPaddingPages = ["/dashboard/basic-chat", "/dashboard/docs"];

  return (
    <SidebarProvider defaultOpen={true}>
      <TooltipProvider>
        <AppSidebar />
      </TooltipProvider>

      <main data-slot="sidebar-inset" className="relative flex w-full flex-1 flex-col bg-background md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2">
        {/* Toast notifications */}
        <div className="fixed top-4 right-4 z-[80] flex w-[min(92vw,380px)] flex-col gap-2">
          {notifications.map((n) => {
            const style = getToastStyle(n.type);
            return (
              <div
                key={n.id}
                className={`rounded-lg border px-3 py-2 shadow-lg backdrop-blur-sm ${style.wrapper}`}
              >
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px] leading-5">{style.icon}</span>
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
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col h-full w-full">
          <Header />
          <div className={`flex-1 overflow-y-auto custom-scrollbar ${noPaddingPages.includes(pathname) ? "" : "p-6 lg:p-10"} ${noPaddingPages.includes(pathname) ? "flex flex-col overflow-hidden" : ""}`}>
            <div className={`${noPaddingPages.includes(pathname) ? "flex-1 w-full h-full flex flex-col" : "max-w-7xl mx-auto"}`}>
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}
