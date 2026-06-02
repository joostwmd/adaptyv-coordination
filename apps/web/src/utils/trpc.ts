import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Keep React Query client for consistent async state management patterns
// Even though we're using Zustand for prototype data, React Query is still
// useful for any remaining async operations (like file uploads, external APIs, etc.)
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      toast.error(error.message, {
        action: {
          label: "retry",
          onClick: query.invalidate,
        },
      });
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false, // Disable for prototype mode
    },
  },
});

// Note: tRPC client removed for prototype mode
// When ready to switch back to real API, uncomment the following:
// 
// import type { AppRouter } from "@adaptyv-coordination/api/routers/index";
// import { env } from "@adaptyv-coordination/env/web";
// import { createTRPCClient, httpBatchLink } from "@trpc/client";
// import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
// 
// export const trpcClient = createTRPCClient<AppRouter>({
//   links: [
//     httpBatchLink({
//       url: `${env.VITE_SERVER_URL}/trpc`,
//     }),
//   ],
// });
// 
// export const trpc = createTRPCOptionsProxy<AppRouter>({
//   client: trpcClient,
//   queryClient,
// });
