import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import logo from "../../assets/phish-logo-transparent.png";
import { login } from "../../lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    mutate: loginMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.setQueryData(["authUser"], data);
      navigate("/dashboard");
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    loginMutation({ email, password });
  };

  const errorMessage =
    error?.response?.data?.message || "Unable to connect to the server";

  return (
   <div className="relative min-h-screen overflow-hidden bg-[#cfe1ff] flex items-center justify-center px-4">

      <div className="w-full max-w-md">
        <div className="bg-white shadow-2xl rounded-2xl p-10">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src={logo}
              alt="PhishGuard Logo"
              className="theme-logo w-40 h-auto object-contain"
            />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="login-title text-2xl font-extrabold text-black">
              Welcome Back
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Sign in to access your PhishGuard dashboard
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">
                  Email
                </span>
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered w-full rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            {/* Password */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">
                  Password
                </span>
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-bordered w-full pr-12 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-sky-500 transition"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="btn bg-sky-500 hover:bg-sky-600 border-0 text-white w-full py-3 mt-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              {isPending ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>

                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              ) : null}

              {isPending ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-400">
            © 2026 <span className="font-semibold text-sky-600">PhishGuard By Marizu Inc</span>.
            All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
