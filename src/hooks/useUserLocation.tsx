
import { useState, useEffect } from "react";

export const useUserLocation = () => {
  const [userLocation, setUserLocation] = useState<string>("Accra, Greater Accra Region");

  useEffect(() => {
    // Load saved location from localStorage on mount
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      setUserLocation(savedLocation);
    }
  }, []);

  const updateLocation = (newLocation: string) => {
    setUserLocation(newLocation);
    localStorage.setItem('userLocation', newLocation);
  };

  return {
    userLocation,
    updateLocation
  };
};
