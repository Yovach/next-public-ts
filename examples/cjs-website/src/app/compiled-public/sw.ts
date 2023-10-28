/// <reference lib="WebWorker" />
export type {};
declare let self: ServiceWorkerGlobalScope;

self.addEventListener("install", async () => {
  console.log("Service worker installed (cjs)");
});

self.addEventListener("fetch", (evt: FetchEvent) => {
  // Do your magic here. E.g. if you want to cache third party resources:
});

self.addEventListener("error", (err) => {
  console.error("Service worker error", err);
});
