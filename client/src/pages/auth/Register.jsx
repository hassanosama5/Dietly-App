import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { AlertCircle, Eye, EyeOff, Loader2, Mail, Lock, User, Salad, Target, Zap, Shield } from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const { register, error, clearError } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) clearError();
    if (localError) setLocalError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setLocalError("Password must be at least 6 characters long");
      return;
    }

    setIsSubmitting(true);

    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);

    if (!result.success) {
      setIsSubmitting(false);
    }
  };

  const displayError = error || localError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl blur-xl opacity-50"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl mx-auto mb-6">
              <Salad className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Join Dietly
            </span>
          </h1>
          <p className="text-gray-600 text-lg">Start your health journey today</p>
        </div>

        {/* Register Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {displayError && (
              <Alert variant="destructive" className="border-l-4 border-red-500 rounded-xl">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="ml-2 text-red-800 font-medium">
                  {displayError}
                </AlertDescription>
              </Alert>
            )}

            {/* Full Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                Full Name
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="pl-12 py-3.5 text-gray-900 bg-white border-gray-300 rounded-xl
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="pl-12 py-3.5 text-gray-900 bg-white border-gray-300 rounded-xl
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="pl-12 pr-12 py-3.5 text-gray-900 bg-white border-gray-300 rounded-xl
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                Confirm Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="pl-12 pr-12 py-3.5 text-gray-900 bg-white border-gray-300 rounded-xl
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-xs text-blue-800 font-medium mb-1">Password requirements:</p>
              <ul className="text-xs text-blue-700 space-y-0.5 ml-4 list-disc">
                <li>At least 6 characters long</li>
                <li>Both passwords must match</li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="gradient"
              size="xl"
              className="w-full relative overflow-hidden rounded-xl transition-all duration-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}

              {/* Shine Effect */}
              {!isSubmitting && (
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                              translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                </div>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/80 text-gray-500 font-medium">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Sign In Link */}
          <Button
            variant="outline"
            size="xl"
            asChild
            className="w-full border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          >
            <Link to="/login">
              Sign In
            </Link>
          </Button>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-xs font-semibold text-gray-700">Personalized</p>
          </div>
          <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
            <div className="flex items-center justify-center mb-2">
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-xs font-semibold text-gray-700">Fast Setup</p>
          </div>
          <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
            <div className="flex items-center justify-center mb-2">
              <Shield className="w-8 h-8 text-pink-600" />
            </div>
            <p className="text-xs font-semibold text-gray-700">Secure</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Register;
