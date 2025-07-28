
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, Mail, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect authenticated users to their intended destination or home
  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        const displayName = firstName && lastName ? `${firstName} ${lastName}` : fullName;
        const { error } = await signUp(email, password, displayName);
        if (error) {
          setError(error.message);
        } else {
          setSuccess("Account created successfully! Please check your email to verify your account.");
          setEmail("");
          setPassword("");
          setFullName("");
          setFirstName("");
          setLastName("");
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        }
        // Navigation is handled by the useEffect above when user state changes
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setFirstName("");
    setLastName("");
    setError(null);
    setSuccess(null);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Back button - positioned absolutely */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back to Home</span>
      </button>

      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo/Brand */}
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isSignUp ? "Sign Up for Push" : "Welcome back"}
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="First Name"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="Last Name"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email Address"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Password"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium" 
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? "Sign Up" : "Sign In"}
            </Button>

            {isSignUp && (
              <p className="text-xs text-gray-500 text-center">
                By creating an account, you agree with our{" "}
                <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>{" "}
                and{" "}
                <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
              </p>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm text-gray-600 hover:text-blue-600"
              >
                {isSignUp
                  ? "Already have an account? Login."
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Blue gradient background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700 items-center justify-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20"></div>
        <div className="relative z-10">
          {/* Abstract geometric shapes */}
          <div className="flex items-center justify-center">
            <div className="w-24 h-6 bg-yellow-400 rounded-full transform rotate-45 mb-4"></div>
            <div className="w-24 h-6 bg-green-400 rounded-full transform -rotate-45 ml-4"></div>
          </div>
        </div>
        
        {/* Additional decorative circles */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-yellow-400/20 rounded-full"></div>
      </div>
    </div>
  );
};

export default Auth;
