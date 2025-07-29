import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { locationService, Location } from '@/services/locationService';
import { useToast } from '@/hooks/use-toast';

interface LocationContextType {
  // Cached location data
  regions: Location[];
  cities: Location[];
  towns: Location[];
  
  // Loading states
  loadingRegions: boolean;
  loadingCities: boolean;
  loadingTowns: boolean;
  
  // Cache management
  getCitiesByRegion: (regionId: string) => Promise<Location[]>;
  getTownsByCity: (cityId: string) => Promise<Location[]>;
  refreshLocations: () => Promise<void>;
  
  // Cache status
  isInitialized: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [regions, setRegions] = useState<Location[]>([]);
  const [cities, setCities] = useState<Location[]>([]);
  const [towns, setTowns] = useState<Location[]>([]);
  
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingTowns, setLoadingTowns] = useState(false);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [citiesCache, setCitiesCache] = useState<Record<string, Location[]>>({});
  const [townsCache, setTownsCache] = useState<Record<string, Location[]>>({});
  
  const { toast } = useToast();

  // Load all regions on mount
  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    if (regions.length > 0) return; // Already loaded
    
    try {
      setLoadingRegions(true);
      const regionsData = await locationService.getLocationsByType('region');
      setRegions(regionsData);
      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading regions:', error);
      toast({
        title: "Error",
        description: "Failed to load regions",
        variant: "destructive"
      });
    } finally {
      setLoadingRegions(false);
    }
  };

  const getCitiesByRegion = async (regionId: string): Promise<Location[]> => {
    // Check cache first
    if (citiesCache[regionId]) {
      return citiesCache[regionId];
    }

    try {
      setLoadingCities(true);
      const citiesData = await locationService.getLocationsByParent(regionId);
      
      // Cache the result
      setCitiesCache(prev => ({
        ...prev,
        [regionId]: citiesData
      }));
      
      return citiesData;
    } catch (error) {
      console.error('Error loading cities:', error);
      toast({
        title: "Error",
        description: "Failed to load cities",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoadingCities(false);
    }
  };

  const getTownsByCity = async (cityId: string): Promise<Location[]> => {
    // Check cache first
    if (townsCache[cityId]) {
      return townsCache[cityId];
    }

    try {
      setLoadingTowns(true);
      const townsData = await locationService.getLocationsByParent(cityId);
      
      // Cache the result
      setTownsCache(prev => ({
        ...prev,
        [cityId]: townsData
      }));
      
      return townsData;
    } catch (error) {
      console.error('Error loading towns:', error);
      toast({
        title: "Error",
        description: "Failed to load towns",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoadingTowns(false);
    }
  };

  const refreshLocations = async () => {
    // Clear all caches
    setCitiesCache({});
    setTownsCache({});
    setCities([]);
    setTowns([]);
    
    // Reload regions
    await loadRegions();
  };

  const value: LocationContextType = {
    regions,
    cities,
    towns,
    loadingRegions,
    loadingCities,
    loadingTowns,
    getCitiesByRegion,
    getTownsByCity,
    refreshLocations,
    isInitialized
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
}; 