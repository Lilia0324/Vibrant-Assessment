import React from "react";
import {useTestResults, useUpdateTestStatus, TestStatus} from '../hooks/useTestResults'

export function TestResultsPanel() {
  const { data, isLoading, isError, error, refetch, isFetching } = useTestResults();
  const update = useUpdateTestStatus();

  const busyId = React.useMemo(() => (update.isPending ? (update.variables?.id ?? null) : null), [update]);

  if (isLoading) {
    return (
      <div className="rounded-md border p-3 text-sm">
        Loading test results…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md border p-3">
        <div className="text-red-600 text-sm mb-2">Failed to load: {error.message}</div>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded bg-black px-3 py-1.5 text-white text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-md border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm opacity-70">
          {isFetching ? "Refreshing…" : "Up to date"}
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded bg-black px-3 py-1.5 text-white text-sm"
        >
          Refresh
        </button>
      </div>

      <div className="text-sm">
        <strong>Counts:</strong>{" "}
        {data &&
          (["pending", "running", "passed", "failed", "skipped"] as TestStatus[]).map((k, i) => (
            <span key={k}>
              {k}:{data.counts[k]}
              {i < 4 ? " · " : ""}
            </span>
          ))}
      </div>

      <ul className="divide-y">
        {data?.items.map((t) => (
          <li key={t.id} className="py-2 flex items-center justify-between">
            <div className="min-w-0">
              <div className="font-medium">{t.name}</div>
              <div className="text-xs opacity-70">
                {t.status} · {new Date(t.updatedAt).toLocaleString()}
              </div>
            </div>
            <div className="flex gap-2">
              {(["pending", "running", "passed", "failed", "skipped"] as TestStatus[])
                .filter((s) => s !== t.status)
                .slice(0, 3) // keep UI compact; adjust as needed
                .map((s) => (
                  <button
                    key={s}
                    onClick={() => update.mutate({ id: t.id, status: s })}
                    className="rounded border px-2 py-1 text-xs"
                    disabled={busyId === t.id}
                    aria-busy={busyId === t.id}
                    title={`Mark ${t.name} as ${s}`}
                  >
                    {busyId === t.id ? "Saving…" : s}
                  </button>
                ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}