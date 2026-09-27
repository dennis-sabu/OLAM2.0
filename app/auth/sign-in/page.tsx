"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrainCircuit, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function SignIn() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect to app
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/app/dashboard");
    }
  }, [user, authLoading, router]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please verify your credentials.");
        } else if (signInError.message.includes("Email not confirmed")) {
          setError("Your email has not been confirmed yet. Please check your inbox.");
        } else {
          setError(signInError.message || "An unexpected error occurred during sign in.");
        }
        return;
      }

      router.push("/app/dashboard");
    } catch (err: any) {
      setError(err?.message || "Failed to connect to the authentication service. Check your network.");
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
          <h1 className="font-display text-3xl text-white">Welcome back</h1>
          <p className="font-body text-white/60">Enter your details to sign in.</p>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="font-ui leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
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
            <div className="flex items-center justify-between">
               <label className="text-sm font-ui text-white/80 block">Password</label>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              disabled={loading}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-ui focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 rounded-lg bg-primary hover:bg-primary-hover text-white font-ui font-medium transition-colors glow-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="text-center pt-2">
           <p className="text-sm font-ui text-white/60">
             Don't have an account? <Link href="/auth/sign-up" className="text-primary hover:text-primary-hover font-medium transition-colors">Sign up</Link>
           </p>
        </div>
      </div>
    </div>
  );
}
