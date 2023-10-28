"use client";

import { useEffect, useState } from 'react';

export function ContentSW() {

  const [isInstalled, setIsInstalled] = useState(false);
  useEffect(function registerSw() {
    navigator.serviceWorker.register('/sw.js', { type: "module" }).then((value) => {
      setIsInstalled(true);
    }).catch((err) => {
      console.error(err);
    });
  }, []);

  return (
    <>
      {isInstalled ? (<span>Installed</span>) : (<span>Not installed</span>)}
    </>
  );
}
