"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api/client";

export type AsyncState<T> = {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
};

type UseFetchOptions = {
  /** Auto-run on mount. Default true. */
  enabled?: boolean;
  /** Poll interval in ms. Omit to disable. */
  refreshIntervalMs?: number;
};

export function useFetch<T>(
  fetcher: () => Promise<T>,
  options: UseFetchOptions = {},
) {
  const { enabled = true, refreshIntervalMs } = options;
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: enabled,
    isRefreshing: false,
  });

  const run = useCallback(async (mode: "initial" | "refresh" = "initial") => {
    setState((prev) => ({
      ...prev,
      isLoading: mode === "initial" && prev.data === null,
      isRefreshing: mode === "refresh" || prev.data !== null,
      error: null,
    }));

    try {
      const data = await fetcherRef.current();
      setState({
        data,
        error: null,
        isLoading: false,
        isRefreshing: false,
      });
      return data;
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Unknown error";
      setState((prev) => ({
        ...prev,
        error: message,
        isLoading: false,
        isRefreshing: false,
      }));
      return null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void run("initial");
  }, [enabled, run]);

  useEffect(() => {
    if (!enabled || !refreshIntervalMs) return;
    const id = window.setInterval(() => {
      void run("refresh");
    }, refreshIntervalMs);
    return () => window.clearInterval(id);
  }, [enabled, refreshIntervalMs, run]);

  return {
    ...state,
    refetch: () => run("refresh"),
  };
}
