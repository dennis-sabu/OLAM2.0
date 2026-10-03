"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrainCircuit, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { upsertProfile } from "@/lib/data/profile";

export default function SignUp() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // If already authenticated, redirect to app
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/app/dashboard");
    }
  }, [user, authLoading, router]);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter a password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);

      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== "undefined" ? window.location.origin : "");
      const redirectUrl = `${siteUrl}/app/dashboard`;

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            name: trimmedName,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("User already registered")) {
          setError("An account with this email already exists. Please sign in.");
        } else {
          setError(signUpError.message || "An error occurred during sign up.");
        }
        return;
      }

      if (data?.user) {
        // Create initial profile in the database
        try {
          await upsertProfile(
            data.user.id,
            { name: trimmedName, focusArea: "Academics" },
            trimmedEmail
          );
        } catch (profileErr) {
          console.warn("Could not save initial profile record:", profileErr);
          // Don't fail the registration if trigger already handles it or table will be populated
        }

        // If session exists immediately, navigate directly to dashboard
        if (data.session) {
          router.push("/app/dashboard");
          return;
        }

        // If email confirmation is required
        setSuccessMessage("Account created! Please check your email for a confirmation link, then sign in.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to create account. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-primary/10 blur-[100px] -z-10" />
      
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2">
         <BrainCircuit className="w-6 h-6 text-primary" />
         <span className="font-display text-xl font-bold text-white">FlowState</span>
      </Link>

      <div className="w-full max-w-md glass-card p-8 space-y-8 relative z-10">
        <div className="space-y-2 text-center">
          <h1 className="font-display text-3xl text-white">Create Account</h1>
          <p className="font-body text-white/60">Start managing your workload sustainably.</p>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="font-ui leading-relaxed">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="font-ui leading-relaxed">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-ui text-white/80 block">Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
              required
              disabled={loading}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-ui focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-ui text-white/80 block">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              disabled={loading}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-ui focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-ui text-white/80 block">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="new-password"
              disabled={loading}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-ui focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
            />
            <p className="text-xs text-white/40 font-ui">Minimum 6 characters</p>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 rounded-lg bg-primary hover:bg-primary-hover text-white font-ui font-medium transition-colors glow-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Creating account…" : "Sign Up"}
          </button>
        </form>

        <div className="text-center pt-2">
           <p className="text-sm font-ui text-white/60">
             Already have an account? <Link href="/auth/sign-in" className="text-primary hover:text-primary-hover font-medium transition-colors">Sign in</Link>
           </p>
        </div>
      </div>
    </div>
  );
}
