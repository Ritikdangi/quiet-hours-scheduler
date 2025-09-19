"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // login or signup
  const [msg, setMsg] = useState("");
  const router = useRouter();


  const handleSubmit = async (e) => {
    e.preventDefault();
    let result;

    if (mode === "login") {
      result = await supabase.auth.signInWithPassword({ email, password });
      if (result.error) {
        setMsg(result.error.message);
      } else {
        router.push("/dashboard"); // Redirect after successful login
      }
    } else {
      result = await supabase.auth.signUp(
        { email, password },
        {
          emailRedirectTo: process.env.NEXT_PUBLIC_EMAIL_REDIRECT || "http://localhost:3000/auth"
        }
      );
      if (result.error) {
        setMsg(result.error.message);
      } else {
        // Redirect to login page with check-email message
        setMsg(" Please check your email to confirm your account then login.");
        router.push("/auth");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="p-6 bg-gray-800 rounded-xl space-y-4 w-80">
        <h2 className="text-xl font-bold">{mode === "login" ? "Login" : "Signup"}</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 rounded bg-gray-700"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 rounded bg-gray-700"
        />
        <button type="submit" className="w-full p-2 bg-blue-600 rounded">
          {mode === "login" ? "Login" : "Signup"}
        </button>
        <p
          className="text-sm cursor-pointer"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "No account? Signup" : "Have an account? Login"}
        </p>
        {msg && <p className="text-sm">{msg}</p>}
      </form>
    </div>
  );
}
