/// <reference lib="WebWorker" />
export type {};
declare let self: ServiceWorkerGlobalScope;

self.addEventListener("install", async () => {
  console.log("Service worker installed (%checksum%) on version " + process.env.NEXT_PUBLIC_VERSION);
});

self.addEventListener("fetch", (evt: FetchEvent) => {
  // Do your magic here. E.g. if you want to cache third party resources:
});

self.addEventListener("error", (err) => {
  console.error("Service worker error (%checksum%)", err);
});

self.addEventListener("activate", () => {
  console.log("Service worker activated (%checksum%)");
});
