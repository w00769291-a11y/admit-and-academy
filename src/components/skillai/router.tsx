// Minimal react-router-dom compatible API on top of TanStack Router, scoped under BASE.
import { useCallback, useMemo, type ReactNode } from "react";
import { useNavigate as useTsNavigate, useRouterState } from "@tanstack/react-router";

export const BASE = "/directors/skillai";

function toHref(to: string) {
  return BASE + (to === "/" ? "" : to);
}

export function useLocation() {
  const loc = useRouterState({ select: (s) => s.location });
  let pathname = loc.pathname.startsWith(BASE) ? loc.pathname.slice(BASE.length) : loc.pathname;
  pathname = pathname.replace(/\/$/, "") || "/";
  return { pathname, search: loc.searchStr ?? "" };
}

export function useNavigate() {
  const nav = useTsNavigate();
  return useCallback((to: string | number) => {
    if (typeof to === "number") { window.history.go(to); return; }
    nav({ href: toHref(to) });
  }, [nav]);
}

export function useSearchParams(): [URLSearchParams, (next: Record<string, string> | URLSearchParams) => void] {
  const searchStr = useRouterState({ select: (s) => s.location.searchStr ?? "" });
  const { pathname } = useLocation();
  const nav = useTsNavigate();
  const params = useMemo(() => new URLSearchParams(searchStr), [searchStr]);
  const set = useCallback((next: Record<string, string> | URLSearchParams) => {
    const qs = new URLSearchParams(next as Record<string, string>).toString();
    nav({ href: toHref(pathname) + (qs ? `?${qs}` : ""), replace: true });
  }, [nav, pathname]);
  return [params, set];
}

type LinkProps = { to: string; className?: string | ((s: { isActive: boolean }) => string); children?: ReactNode; end?: boolean } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "href">;

export function Link({ to, className, children, end: _end, onClick, ...rest }: LinkProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const path = to.split("?")[0];
  const isActive = pathname === path;
  const cls = typeof className === "function" ? className({ isActive }) : className;
  return (
    <a {...rest} href={toHref(to)} className={cls} onClick={(e) => {
      onClick?.(e);
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.button !== 0) return;
      e.preventDefault();
      navigate(to);
    }}>{children}</a>
  );
}

export const NavLink = Link;
