import { useState, useEffect } from "react";

interface GeolocationState {
  lat: number | null;
  lng: number | null;
  error: string | null;
  isLoading: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocalização não é suportada pelo seu navegador.",
        isLoading: false,
      }));
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setState({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        error: null,
        isLoading: false,
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      let message = "Ocorreu um erro ao obter sua localização.";
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = "Permissão para geolocalização foi negada.";
          break;
        case error.POSITION_UNAVAILABLE:
          message = "As informações de localização não estão disponíveis.";
          break;
        case error.TIMEOUT:
          message = "A requisição para obter a localização expirou.";
          break;
      }
      setState((prev) => ({
        ...prev,
        error: message,
        isLoading: false,
      }));
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  }, []);

  return state;
};
