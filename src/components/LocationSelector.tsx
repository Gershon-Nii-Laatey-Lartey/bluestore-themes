
import { useState, useEffect } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { locationService, Location } from "@/services/locationService";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface LocationSelectorProps {
  currentLocation?: string;
  onLocationChange?: (location: string) => void;
  className?: string;
}

export const LocationSelector = ({ 
  currentLocation = "Accra, Greater Accra Region", 
  onLocationChange,
  className = ""
}: LocationSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [regions, setRegions] = useState<Location[]>([]);
  const [cities, setCities] = useState<Location[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      setLoading(true);
      const regionsData = await locationService.getLocationsByType('region');
      console.log('Loaded regions:', regionsData);
      setRegions(regionsData);
    } catch (error) {
      console.error('Error loading regions:', error);
      toast({
        title: "Error",
        description: "Failed to load regions. Please refresh the page and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async (regionId: string) => {
    try {
      console.log('Loading cities for region:', regionId);
      const citiesData = await locationService.getLocationsByParent(regionId);
      console.log('Loaded cities:', citiesData);
      setCities(citiesData);
    } catch (error) {
      console.error('Error loading cities:', error);
      toast({
        title: "Error",
        description: "Failed to load cities",
        variant: "destructive"
      });
    }
  };

  const handleRegionChange = (regionId: string) => {
    console.log('Region changed to:', regionId);
    setSelectedRegion(regionId);
    setSelectedCity("");
    setCities([]);
    if (regionId) {
      loadCities(regionId);
    }
  };

  const handleLocationConfirm = () => {
    if (selectedRegion && selectedCity) {
      const region = regions.find(r => r.id === selectedRegion);
      const city = cities.find(c => c.id === selectedCity);
      
      if (region && city) {
        const locationString = `${city.name}, ${region.name}`;
        onLocationChange?.(locationString);
        
        // Store in localStorage for persistence
        localStorage.setItem('userLocation', locationString);
        
        setIsOpen(false);
        
        toast({
          title: "Location Updated",
          description: `Your location has been set to ${locationString}`,
        });
      }
    }
  };

  if (!isOpen) {
    return (
      <div className={`relative ${className}`}>
        <Button
          variant="ghost"
          className="flex items-center text-gray-600 hover:text-gray-800 max-w-48 md:max-w-none"
          onClick={() => setIsOpen(true)}
        >
          <MapPin className="h-4 w-4 mr-1 text-blue-600 flex-shrink-0" />
          <span className="text-sm font-medium truncate">{currentLocation}</span>
          <ChevronDown className="h-3 w-3 ml-1 flex-shrink-0" />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="flex items-center text-gray-600 hover:text-gray-800 max-w-48 md:max-w-none"
        onClick={() => setIsOpen(true)}
      >
        <MapPin className="h-4 w-4 mr-1 text-blue-600 flex-shrink-0" />
        <span className="text-sm font-medium truncate">{currentLocation}</span>
        <ChevronDown className="h-3 w-3 ml-1 flex-shrink-0" />
      </Button>
      
      <div className={`
        bg-white border rounded-lg shadow-lg p-4 z-[100] mt-1
        ${isMobile 
          ? 'fixed inset-x-4 top-20 max-h-[80vh] overflow-y-auto' 
          : 'absolute left-0 min-w-80 max-w-96'
        }
      `}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Select Your Location</h3>
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-gray-500"
              >
                ✕
              </Button>
            )}
          </div>
          
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Region *</label>
            <Select 
              value={selectedRegion} 
              onValueChange={handleRegionChange} 
              disabled={loading || regions.length === 0}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder={loading ? "Loading regions..." : "Select a region"} />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-[110] max-h-60 overflow-y-auto">
                {regions.length === 0 && !loading ? (
                  <SelectItem value="no-regions" disabled>
                    No regions available
                  </SelectItem>
                ) : (
                  regions.map((region) => (
                    <SelectItem key={region.id} value={region.id} className="cursor-pointer hover:bg-gray-50">
                      {region.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {regions.length === 0 && !loading && (
              <p className="text-xs text-red-500 mt-1">
                No regions found. Please contact support.
              </p>
            )}
          </div>

          {selectedRegion && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">City *</label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder={cities.length === 0 ? "Loading cities..." : "Select a city"} />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-[110] max-h-60 overflow-y-auto">
                  {cities.length === 0 ? (
                    <SelectItem value="no-cities" disabled>
                      {selectedRegion ? "Loading cities..." : "Select a region first"}
                    </SelectItem>
                  ) : (
                    cities.map((city) => (
                      <SelectItem key={city.id} value={city.id} className="cursor-pointer hover:bg-gray-50">
                        {city.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleLocationConfirm}
              disabled={!selectedRegion || !selectedCity}
              className="flex-1"
            >
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
