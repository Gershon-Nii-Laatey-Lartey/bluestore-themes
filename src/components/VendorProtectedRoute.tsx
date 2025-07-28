
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { dataService } from "@/services/dataService";

interface VendorProtectedRouteProps {
  children: React.ReactNode;
}

export const VendorProtectedRoute = ({ children }: VendorProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [vendorProfile, setVendorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkVendorProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const profile = await dataService.getVendorProfile();
        setVendorProfile(profile);
      } catch (error) {
        console.error("Error checking vendor profile:", error);
        setVendorProfile(null);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      checkVendorProfile();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  // Show loading state while checking auth and vendor profile
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If user doesn't have a vendor profile, redirect to vendor required page
  if (!vendorProfile) {
    return <Navigate to="/vendor-required" state={{ from: location }} replace />;
  }

  // If user is authenticated and has a vendor profile, render the protected content
  return <>{children}</>;
};
