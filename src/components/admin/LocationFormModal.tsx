
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { locationService, Location } from "@/services/locationService";

interface LocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  editingLocation: Location | null;
}

export const LocationFormModal = ({ isOpen, onClose, onSubmit, editingLocation }: LocationFormModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'region' as 'region' | 'city' | 'town',
    parent_id: '',
    active: true
  });
  const [regions, setRegions] = useState<Location[]>([]);
  const [cities, setCities] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadParentOptions();
      if (editingLocation) {
        setFormData({
          name: editingLocation.name,
          type: editingLocation.type,
          parent_id: editingLocation.parent_id || '',
          active: editingLocation.active
        });
      } else {
        setFormData({
          name: '',
          type: 'region',
          parent_id: '',
          active: true
        });
      }
    }
  }, [isOpen, editingLocation]);

  const loadParentOptions = async () => {
    try {
      const [regionsData, citiesData] = await Promise.all([
        locationService.getLocationsByType('region'),
        locationService.getLocationsByType('city')
      ]);
      setRegions(regionsData);
      setCities(citiesData);
    } catch (error) {
      console.error('Error loading parent options:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Location name is required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const locationData = {
        name: formData.name.trim(),
        type: formData.type,
        parent_id: formData.parent_id || null,
        active: formData.active
      };

      if (editingLocation) {
        await locationService.updateLocation(editingLocation.id, locationData);
        toast({
          title: "Success",
          description: "Location updated successfully"
        });
      } else {
        await locationService.createLocation(locationData);
        toast({
          title: "Success",
          description: "Location created successfully"
        });
      }

      onSubmit();
      onClose();
    } catch (error) {
      console.error('Error saving location:', error);
      toast({
        title: "Error",
        description: "Failed to save location",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getParentOptions = () => {
    switch (formData.type) {
      case 'city':
        return regions;
      case 'town':
        return cities;
      default:
        return [];
    }
  };

  const getParentLabel = () => {
    switch (formData.type) {
      case 'city':
        return 'Select Region';
      case 'town':
        return 'Select City';
      default:
        return 'No parent required';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingLocation ? 'Edit Location' : 'Add New Location'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Location Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter location name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'region' | 'city' | 'town') => 
                setFormData({ ...formData, type: value, parent_id: '' })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="region">Region</SelectItem>
                <SelectItem value="city">City</SelectItem>
                <SelectItem value="town">Town</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type !== 'region' && (
            <div className="space-y-2">
              <Label htmlFor="parent">Parent Location</Label>
              <Select
                value={formData.parent_id}
                onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={getParentLabel()} />
                </SelectTrigger>
                <SelectContent>
                  {getParentOptions().map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
            <Label htmlFor="active">Active</Label>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : (editingLocation ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
