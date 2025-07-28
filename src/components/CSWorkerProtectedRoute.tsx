
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { csService } from "@/services/csService";

interface CSWorkerProtectedRouteProps {
  children: React.ReactNode;
}

export const CSWorkerProtectedRoute = ({ children }: CSWorkerProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [isCSWorker, setIsCSWorker] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkCSWorkerAccess = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const csWorkerStatus = await csService.isCSWorker();
        setIsCSWorker(csWorkerStatus);
      } catch (error) {
        console.error("Error checking CS worker access:", error);
        setIsCSWorker(false);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      checkCSWorkerAccess();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  // Show loading state while checking auth and CS worker access
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

  // If user is not a CS worker, redirect to home page
  if (!isCSWorker) {
    return <Navigate to="/" replace />;
  }

  // If user is authenticated and is a CS worker, render the protected content
  return <>{children}</>;
};
