import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, User, Sparkles, AlertCircle, CheckCircle } from "lucide-react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup 
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const validateForm = () => {
    if (isSignUp && !displayName.trim()) {
      setError("Please enter your name");
      return false;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isSignUp) {
        // Sign Up Flow
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: displayName.trim(),
        });
        setSuccess("Account created successfully! Welcome.");
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        // Sign In Flow
        await signInWithEmailAndPassword(auth, email, password);
        setSuccess("Signed in successfully!");
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      console.error("Authentication error:", err);
      let friendlyMessage = "An error occurred during authentication.";
      if (err.code === "auth/email-already-in-use") {
        friendlyMessage = "This email is already in use. Try signing in.";
      } else if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        friendlyMessage = "Incorrect email or password. Please try again.";
      } else if (err.code === "auth/weak-password") {
        friendlyMessage = "Password is too weak. Must be at least 6 characters.";
      } else if (err.message) {
        friendlyMessage = err.message;
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setSuccess("Successfully connected with Google!");
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error("Google login failed:", err);
      if (err.code === "auth/unauthorized-domain") {
        setError(
          "This domain is not authorized for OAuth in your Firebase project.\n\nTo fix this:\n1. Open your Firebase Console\n2. Go to Authentication -> Settings -> Authorized domains\n3. Click 'Add domain' and add:\n   • ais-dev-bhrkisdhrscpjvuw4xr42r-394131466079.asia-east1.run.app\n   • ais-pre-bhrkisdhrscpjvuw4xr42r-394131466079.asia-east1.run.app\n\nAlternatively, you can create an account using your Email and Password right here!"
        );
      } else if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Google Authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative border border-slate-100 z-10"
        >
          {/* Header Theme Line */}
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-xl transition-all"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-8">
            {/* Title / Description */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 mb-3 shadow-sm">
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-1.14 2.77-2.4 3.61v3h3.86c2.26-2.08 3.595-5.14 3.595-8.46z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3a7.14 7.14 0 0 1-4.07 1.16c-3.11 0-5.74-2.11-6.68-4.96H1.4v3.09C3.37 21.3 7.39 24 12 24z" />
                  <path fill="#FBBC05" d="M5.32 14.29a7.16 7.16 0 0 1 0-2.58V8.62H1.4a11.94 11.94 0 0 0 0 6.76l3.92-3.09z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.94 1.19 15.24 0 12 0 7.39 0 3.37 2.7 1.4 6.62l3.92 3.09c.94-2.85 3.57-4.96 6.68-4.96z" />
                </svg>
              </div>
              <h3 className="text-2xl font-display font-bold text-slate-800 tracking-tight">
                {isSignUp ? "Create your Account" : "Welcome Back"}
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                {isSignUp 
                  ? "Track your practice sessions and review smart AI coach feedback anywhere!" 
                  : "Sign in to access your dashboard, saved history, and presentation analytics."
                }
              </p>
            </div>

            {/* Error / Success alerts */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 bg-rose-50 border border-rose-150 text-rose-700 p-3 rounded-xl text-xs flex items-start gap-2"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
                <span className="font-medium leading-normal whitespace-pre-line">{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 bg-emerald-50 border border-emerald-150 text-emerald-700 p-3 rounded-xl text-xs flex items-start gap-2 animate-bounce"
              >
                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                <span className="font-semibold leading-normal">{success}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1">
                  <label className="text-slate-700 text-xs font-semibold block">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Jane Doe"
                      required
                      className="block w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-slate-700 text-xs font-semibold block">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="block w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-slate-700 text-xs font-semibold block">Password</label>
                  {!isSignUp && (
                    <button 
                      type="button" 
                      onClick={() => alert("Please sign in using Google or create a new account if you forgot your credentials.")}
                      className="text-[10px] font-bold text-blue-600 hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="block w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800"
                  />
                </div>
                {isSignUp && (
                  <p className="text-[10px] text-slate-400 font-medium">Password must be at least 6 characters.</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-3 rounded-xl transition shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : isSignUp ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Separator */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-400 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Google Sign-In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm py-2.5 rounded-xl transition-all shadow-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.107C18.29 1.945 15.42 1 12.24 1 5.92 1 12.24s4.92 11.24 11.24 11.24c6.6 0 11-4.63 11-11.24 0-.756-.08-1.333-.18-1.955H12.24z"/>
              </svg>
              <span>Google Account</span>
            </button>

            {/* Switch Mode Link */}
            <p className="text-center text-xs text-slate-500 mt-6 font-medium">
              {isSignUp ? "Already have an account?" : "New to Presentation Coach?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setSuccess(null);
                }}
                className="text-blue-600 hover:underline font-bold"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
