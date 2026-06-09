"use client";

import { APIProvider } from "@vis.gl/react-google-maps";

export function MapProvider({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  return (
    // A biblioteca "places" (legada) foi removida do carregamento inicial, pois estamos utilizando
    // a API Places (New) via rotas do servidor, o que também corrige o LegacyApiNotActivatedMapError.
    <APIProvider apiKey={apiKey}>
      {children}
    </APIProvider>
  );
}
