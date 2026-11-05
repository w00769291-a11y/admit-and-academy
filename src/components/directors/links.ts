import { useCallback } from "react";
import { useNavigate, useRouterState, useSearch } from "@tanstack/react-router";

export type Query = Record<string, string | undefined>;

type NavInput = Parameters<ReturnType<typeof useNavigate>>[0];

/** Convert a skillai-style link ("/approvals?status=Pending") into router props. */
export function directorHref(link: string, query?: Query): { to: string; search: Query } {
  const [path, qs] = link.split("?");
  const search: Query = {};
  if (qs) for (const [k, v] of new URLSearchParams(qs)) search[k] = v;
  if (query) Object.assign(search, query);
  return { to: `/directors${path}`, search };
}

/** Query-string access for the directors module, mirroring react-router's useSearchParams. */
export function useDirectorQuery() {
  const search = useSearch({ strict: false }) as Query;
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const set = useCallback(
    (patch: Query) => {
      const opts = { to: pathname, search: (prev: Query) => ({ ...prev, ...patch }) } as NavInput;
      navigate(opts);
    },
    [navigate, pathname],
  );
  const clear = useCallback(() => {
    const opts = { to: pathname, search: {} } as NavInput;
    navigate(opts);
  }, [navigate, pathname]);
  return { search, set, clear };
}
