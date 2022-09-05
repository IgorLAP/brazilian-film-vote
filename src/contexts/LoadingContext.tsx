import React, { createContext, useEffect, useState } from "react";

import { useRouter } from "next/router";

import { LoadingBar } from "~/components/LoadingBar";

export interface LoadingContextInitial {
  handleLoading: (percentage: number, intervalTime: number) => void;
  clearLoading: () => void;
}

interface loadingProviderProps {
  children: React.ReactNode;
}

const initialValue = {} as LoadingContextInitial;

export const LoadingContext =
  createContext<LoadingContextInitial>(initialValue);

export function LoadingProvider({ children }: loadingProviderProps) {
  const router = useRouter();

  const [loadingStatus, setLoadingStatus] = useState(0);
  const [intervalID, setIntervalID] = useState<NodeJS.Timeout>();

  useEffect(() => {
    if (loadingStatus >= 100) {
      clearLoading();
    }
  }, [loadingStatus]);

  useEffect(() => {
    clearLoading();
  }, [router.pathname]);

  function handleLoading(percentage: number, intervalTime: number) {
    if (!intervalID) {
      setIntervalID(
        setInterval(() => {
          setLoadingStatus((prev) => prev + percentage);
        }, intervalTime)
      );
    }
  }

  function clearLoading() {
    if (intervalID) {
      window.clearInterval(intervalID);
      setIntervalID(undefined);
    }
    if (loadingStatus !== 100) setLoadingStatus(100);
    setTimeout(() => setLoadingStatus(0), 250);
  }

  return (
    <LoadingContext.Provider value={{ clearLoading, handleLoading }}>
      <LoadingBar status={loadingStatus} />
      {children}
    </LoadingContext.Provider>
  );
}
