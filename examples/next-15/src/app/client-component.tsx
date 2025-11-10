"use client";

import { useEffect } from "react";

import url from "./sw.public.ts";

export function ClientComponent() {
  useEffect(() => {
    console.log(url);
    // import("./sw.public.ts").then((mod) => {
    //   navigator.serviceWorker.register(mod.default.src)
    //   console.log(mod.default.src);
    // });
  }, []);
  return <div>Hello from the client component!</div>;
}
