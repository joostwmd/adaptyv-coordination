import { Toaster } from "@adaptyv-coordination/ui/components/sonner";
import { TooltipProvider } from "@adaptyv-coordination/ui/components/tooltip";
import type { QueryClient } from "@tanstack/react-query";
import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { PrototypeControls } from "@/components/dev/PrototypeControls";
import "../index.css";

export interface RouterAppContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "adaptyv-coordination",
      },
      {
        name: "description",
        content: "adaptyv-coordination is a web application",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        <TooltipProvider>
          <div className="grid h-svh grid-rows-[auto_1fr] overflow-hidden">
            <Header />
            <main className="min-h-0 min-w-0 overflow-hidden">
              <Outlet />
            </main>
          </div>
          <Toaster richColors />
          <PrototypeControls />
        </TooltipProvider>
      </ThemeProvider>
    </>
  );
}
