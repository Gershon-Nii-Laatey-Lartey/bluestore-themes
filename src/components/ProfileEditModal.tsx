
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ProfileEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProfileEditModal = ({ open, onOpenChange }: ProfileEditModalProps) => {
  const { user, profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await updateProfile({
        full_name: fullName,
        avatar_url: avatarUrl
      });
      
      if (!error) {
        onOpenChange(false);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = fullName || user?.email || "User";
  const initials = fullName ? getInitials(fullName) : (user?.email ? user.email.charAt(0).toUpperCase() : "U");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl || "/lovable-uploads/c6148684-f71d-4b35-be45-ed4848d5e86d.png"} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                onClick={() => {
                  // For now, just use the default avatar
                  setAvatarUrl("/lovable-uploads/c6148684-f71d-4b35-be45-ed4848d5e86d.png");
                }}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500">Click camera to use default avatar</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
