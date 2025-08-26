import { useMemo } from "react";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";

export type TestStatus = "pending" | "running" | "passed" | "failed" | "skipped";
export interface TestResult {
  id: string;
  name: string;
  status: TestStatus;
  updatedAt: string; // ISO date
  // ...other fields
}

export interface UpdateStatusPayload {
  id: string;
  status: TestStatus;
}


const qk = {
  all: ["testResults"] as const,
  byId: (id: string) => ["testResults", id] as const, // an example detail query
};

async function getJSON<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}


export function useTestResults(): UseQueryResult<
  {
    items: TestResult[];
    counts: Record<TestStatus, number>;
  },
  Error
> {
  return useQuery<{ items: TestResult[]; counts: Record<TestStatus, number> }, Error>({
    queryKey: qk.all,
    queryFn: async () => {
      const data = await getJSON<TestResult[]>("/api/test-results");
      return { items: data, counts: {} as any }; // filled in via select below
    },
    // Data is considered fresh for 15 seconds; this balances UI responsiveness vs. server load
    staleTime: 15_000,
    // We deliberately disable focus refetch to prevent unexpected list "jumping" while a user
    // is reading, especially since we keep a short staleTime and expose a Retry button.
    refetchOnWindowFocus: false,
    // Shape data: sort by updatedAt desc and compute status counts once.
    retry: 0, // do not retry as we want to randomly fail or success
    select: (raw) => {
      const items = [...raw.items].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      const counts = items.reduce(
        (acc, r) => {
          acc[r.status] = (acc[r.status] ?? 0) + 1;
          return acc;
        },
        { pending: 0, running: 0, passed: 0, failed: 0, skipped: 0 } as Record<TestStatus, number>
      );
      return { items, counts };
    },
  });
}

export function useUpdateTestStatus() {
  const qc = useQueryClient();

  return useMutation<
    TestResult, // server returns the updated record
    Error,
    UpdateStatusPayload,
    { prevList?: { items: TestResult[]; counts: Record<TestStatus, number> } }
  >({
    mutationKey: ["updateTestStatus"],
    mutationFn: async ({ id, status }) =>
      getJSON<TestResult>(`/api/test-results/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),

    // ---- optimistic update ----
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: qk.all });

      const prevList = qc.getQueryData<{ items: TestResult[]; counts: Record<TestStatus, number> }>(
        qk.all
      );

      // Apply optimistic change to the list cache
      qc.setQueryData<{ items: TestResult[]; counts: Record<TestStatus, number> }>(qk.all, (old) => {
        if (!old) return old as any;

        const items = old.items.map((item) =>
          item.id === id
            ? {
                ...item,
                status,
                // mark a recent optimistic time to keep sort stable-ish
                updatedAt: new Date().toISOString(),
              }
            : item
        );

        // recompute counts after optimistic change
        const counts = items.reduce(
          (acc, r) => {
            acc[r.status] = (acc[r.status] ?? 0) + 1;
            return acc;
          },
          { pending: 0, running: 0, passed: 0, failed: 0, skipped: 0 } as Record<TestStatus, number>
        );

        return { items, counts };
      });

      return { prevList };
    },

    // ---- rollback on error ----
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevList) {
        qc.setQueryData(qk.all, ctx.prevList);
      }
    },

    // ---- reconcile on success ----
    onSuccess: (serverItem) => {
      // Merge the definitive server response into the list cache without nuking everything.
      qc.setQueryData<{ items: TestResult[]; counts: Record<TestStatus, number> }>(qk.all, (old) => {
        if (!old) return old as any;
        const items = old.items.map((i) => (i.id === serverItem.id ? serverItem : i));
        const counts = items.reduce(
          (acc, r) => {
            acc[r.status] = (acc[r.status] ?? 0) + 1;
            return acc;
          },
          { pending: 0, running: 0, passed: 0, failed: 0, skipped: 0 } as Record<TestStatus, number>
        );
        return { items, counts };
      });

      // If we also cache item details: qc.setQueryData(qk.byId(serverItem.id), serverItem);
    },

    // ---- narrow invalidation ----
    // We keep it narrow by only invalidating the list key (and/or specific item if you use qk.byId).
    onSettled: (_data, _err, _vars) => {
      qc.invalidateQueries({ queryKey: qk.all, exact: true });
      // qc.invalidateQueries({ queryKey: qk.byId(_vars.id), exact: true });
    },
  });
}