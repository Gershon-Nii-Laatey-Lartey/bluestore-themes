
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { dataService } from "@/services/dataService";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const adminStatus = await dataService.isAdmin();
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error("Error checking admin access:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      checkAdminAccess();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  // Show loading state while checking auth and admin access
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

  // If user is not an admin, redirect to home page
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // If user is authenticated and is an admin, render the protected content
  return <>{children}</>;
};
