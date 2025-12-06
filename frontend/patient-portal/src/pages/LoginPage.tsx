import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Loader2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  Smartphone,
  Laptop,
  ArrowLeft
} from "lucide-react";
import { motion } from "framer-motion";

const LoginPage: React.FC = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      Swal.fire({
        icon: "error",
        title: "Missing Fields",
        text: "Please fill in all fields.",
        confirmButtonColor: "#2563EB",
      });
      return;
    }

    if (!form.email.includes("@")) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
        confirmButtonColor: "#2563EB",
      });
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome back to MEDBLOCK",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/dashboard");

    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gray-50/50">

      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >

        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg mb-3"
          >
            <Shield className="text-white" size={24} />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            MEDBLOCK
          </h1>
          <p className="text-sm text-gray-500 font-medium">Secure Patient Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl p-6 md:p-8 border border-white/60">

          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-sm text-gray-500 mt-1">Sign in to access your records</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline">
                  Forgot?
                </Link>
              </div>

              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                  value={form.password}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold py-3.5 rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-md"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Sign In"}
            </button>

          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-3 text-xs text-gray-400 font-medium uppercase">Or continue with</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Quick Access */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-blue-200 transition-all flex items-center justify-center gap-2 text-gray-600 text-sm font-medium group">
              <Smartphone size={16} className="group-hover:text-blue-600 transition-colors" /> <span>Mobile App</span>
            </button>

            <button className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-blue-200 transition-all flex items-center justify-center gap-2 text-gray-600 text-sm font-medium group">
              <Laptop size={16} className="group-hover:text-blue-600 transition-colors" /> <span>Web Portal</span>
            </button>
          </div>

          {/* Sign Up */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors">
                Create account
              </Link>
            </p>
          </div>

        </div>

        {/* Small Footer */}
        <div className="mt-6 text-center space-y-3">
          <Link to="/user-selection" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors">
            <ArrowLeft size={14} /> Back to Role Selection
          </Link>
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-1.5 text-[10px] text-gray-400 bg-white/40 rounded-full px-3 py-1 border border-white/30 backdrop-blur-sm">
              <Shield size={10} />
              <span>Secured by Cardano Blockchain</span>
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default LoginPage;
