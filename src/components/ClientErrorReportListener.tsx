import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { reportClientError, type ClientErrorInput } from "@/lib/client-error.functions";

const EVENT_NAME = "smm:client-error-report";

export function requestClientErrorReport(input: ClientErrorInput) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ClientErrorInput>(EVENT_NAME, { detail: input }));
}

function clientContext() {
  const locale = window.localStorage.getItem("lang");
  return {
    pathname: window.location.pathname.slice(0, 300) || "/",
    locale: locale === "ta" ? "ta" as const : "en" as const,
    user_agent: window.navigator.userAgent.slice(0, 500),
  };
}

export function ClientErrorReportListener() {
  const sendReport = useServerFn(reportClientError);

  useEffect(() => {
    const onReport = (event: Event) => {
      const detail = (event as CustomEvent<ClientErrorInput>).detail;
      if (!detail) return;
      void sendReport({ data: { ...detail, ...clientContext() } }).catch(() => {
        // Reporting failures must not interrupt the visitor's experience.
      });
    };
    window.addEventListener(EVENT_NAME, onReport);
    return () => window.removeEventListener(EVENT_NAME, onReport);
  }, [sendReport]);

  return null;
}