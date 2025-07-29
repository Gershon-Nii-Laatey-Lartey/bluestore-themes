
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocationContext } from "@/contexts/LocationContext";

interface ContactInformationFormProps {
  formData: {
    phone: string;
    location: string;
    specificLocation?: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onLocationChange?: (location: string) => void;
  loadingProfile: boolean;
}

export const ContactInformationForm = ({ 
  formData, 
  onInputChange,
  onLocationChange,
  loadingProfile 
}: ContactInformationFormProps) => {
  const [cities, setCities] = useState<any[]>([]);
  const [towns, setTowns] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedTown, setSelectedTown] = useState<string>("");
  const { toast } = useToast();
  
  // Use the location context
  const { 
    regions, 
    loadingRegions, 
    loadingCities, 
    loadingTowns: contextLoadingTowns,
    getCitiesByRegion, 
    getTownsByCity 
  } = useLocationContext();

  // Parse existing location to set initial values
  useEffect(() => {
    if (formData.location && regions.length > 0) {
      const locationParts = formData.location.split(', ');
      if (locationParts.length >= 2) {
        const regionName = locationParts[locationParts.length - 1];
        const cityName = locationParts[locationParts.length - 2];
        const townName = locationParts.length >= 3 ? locationParts[locationParts.length - 3] : null;
        
        const region = regions.find(r => r.name === regionName);
        if (region) {
          setSelectedRegion(region.id);
          getCitiesByRegion(region.id).then((citiesData) => {
            setCities(citiesData);
            const city = citiesData.find(c => c.name === cityName);
            if (city) {
              setSelectedCity(city.id);
              if (townName) {
                getTownsByCity(city.id).then((townsData) => {
                  setTowns(townsData);
                  const town = townsData.find(t => t.name === townName);
                  if (town) {
                    setSelectedTown(town.id);
                  }
                });
              }
            }
          });
        }
      }
    }
  }, [formData.location, regions, getCitiesByRegion, getTownsByCity]);



  const handleRegionChange = async (regionId: string) => {
    setSelectedRegion(regionId);
    setSelectedCity("");
    setSelectedTown("");
    setCities([]);
    setTowns([]);
    if (regionId) {
      const citiesData = await getCitiesByRegion(regionId);
      setCities(citiesData);
    }
    // Clear the location when region changes
    if (onLocationChange) {
      onLocationChange("");
    }
  };

  const handleCityChange = async (cityId: string) => {
    setSelectedCity(cityId);
    setSelectedTown("");
    setTowns([]);
    
    if (cityId) {
      const townsData = await getTownsByCity(cityId);
      setTowns(townsData);
      // Update location if no town is required
      updateLocationString(selectedRegion, cityId, "");
    }
  };

  const handleTownChange = (townId: string) => {
    setSelectedTown(townId);
    updateLocationString(selectedRegion, selectedCity, townId);
  };

  const updateLocationString = (regionId: string, cityId: string, townId: string) => {
    if (!regionId || !cityId) return;
    
    const region = regions.find(r => r.id === regionId);
    const city = cities.find(c => c.id === cityId);
    const town = townId ? towns.find(t => t.id === townId) : null;
    
    if (region && city) {
      let locationString = "";
      if (town) {
        locationString = `${town.name}, ${city.name}, ${region.name}`;
      } else {
        locationString = `${city.name}, ${region.name}`;
      }
      
      if (onLocationChange) {
        onLocationChange(locationString);
      } else {
        // Fallback: create synthetic event for backward compatibility
        const syntheticEvent = {
          target: {
            id: 'location',
            value: locationString
          }
        } as React.ChangeEvent<HTMLInputElement>;
        onInputChange(syntheticEvent);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input 
            id="phone" 
            placeholder="+233 XX XXX XXXX" 
            className="mt-1 bg-gray-100 text-gray-500 cursor-not-allowed"
            value={formData.phone}
            readOnly
            disabled
            required
            tabIndex={-1}
          />
          <p className="text-xs text-gray-500 mt-1">
            Phone number is auto-filled from your vendor profile and cannot be edited here.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>Region *</Label>
            <Select value={selectedRegion} onValueChange={handleRegionChange} disabled={loadingRegions || loadingProfile}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={loadingRegions ? "Loading regions..." : "Select a region"} />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-50">
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>City *</Label>
            <Select value={selectedCity} onValueChange={handleCityChange} disabled={!selectedRegion || loadingProfile || loadingCities}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={loadingCities ? "Loading cities..." : "Select a city"} />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-50">
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Town (Optional)</Label>
            <Select value={selectedTown} onValueChange={handleTownChange} disabled={!selectedCity || loadingProfile || contextLoadingTowns}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={contextLoadingTowns ? "Loading towns..." : "Select a town"} />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-50">
                {towns.map((town) => (
                  <SelectItem key={town.id} value={town.id}>
                    {town.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="specificLocation">Specific Location (Optional)</Label>
          <Input 
            id="specificLocation" 
            name="specificLocation"
            placeholder="e.g., Near Accra Mall, East Legon" 
            className="mt-1"
            value={formData.specificLocation || ''}
            onChange={onInputChange}
            disabled={loadingProfile}
          />
          <p className="text-xs text-gray-500 mt-1">
            Add more details about your exact location
          </p>
        </div>

        {formData.location && (
          <div className="p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>Selected Location:</strong> {formData.location}
            </p>
          </div>
        )}

        {loadingProfile && (
          <p className="text-xs text-gray-500">Loading profile information...</p>
        )}
      </CardContent>
    </Card>
  );
};
