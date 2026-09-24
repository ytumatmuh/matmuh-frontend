"use client";

import { Suspense, createContext, useContext, useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import { useSearchParams } from "next/navigation";

const AlternateLocaleContext = createContext({ paths: {}, setPaths: () => {} });

export function AlternateLocaleProvider({ children }) {
  const [paths, setPaths] = useState({});
  const value = useMemo(() => ({ paths, setPaths }), [paths]);
  return (
    <AlternateLocaleContext.Provider value={value}>{children}</AlternateLocaleContext.Provider>
  );
}

export function useAlternateLocalePaths() {
  return useContext(AlternateLocaleContext).paths;
}

export default function AlternateLocalePaths({ paths }) {
  const { setPaths } = useContext(AlternateLocaleContext);
  const serialized = JSON.stringify(paths ?? {});

  useEffect(() => {
    setPaths(JSON.parse(serialized));
    return () => setPaths({});
  }, [serialized, setPaths]);

  return null;
}

function withQuery(href, query) {
  if (!query) return href;
  return `${href}${href.includes("?") ? "&" : "?"}${query}`;
}

function LinkKeepingQuery({ href, ...props }) {
  const query = useSearchParams().toString();
  return <NextLink href={withQuery(href, query)} {...props} />;
}

export function LocaleSwitchLink(props) {
  return (
    <Suspense fallback={<NextLink {...props} />}>
      <LinkKeepingQuery {...props} />
    </Suspense>
  );
}
