"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function HomePage() {
  const supabase = createClient();

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupMessage, setSignupMessage] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data.user?.email ?? "");
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? "");
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignupMessage("");

    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: { full_name: signupName },
      },
    });

    if (error) setSignupMessage(error.message);
    else setSignupMessage("Signup successful. Check your email.");
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) setLoginMessage(error.message);
    else setLoginMessage("Logged in successfully.");
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>Neonadri Auth Test</h1>

      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
        <input placeholder="Name" value={signupName} onChange={(e)=>setSignupName(e.target.value)} />
        <input placeholder="Email" value={signupEmail} onChange={(e)=>setSignupEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={signupPassword} onChange={(e)=>setSignupPassword(e.target.value)} />
        <button type="submit">Sign Up</button>
      </form>
      <p>{signupMessage}</p>

      <h2>Log In</h2>
      <form onSubmit={handleLogin}>
        <input placeholder="Email" value={loginEmail} onChange={(e)=>setLoginEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={loginPassword} onChange={(e)=>setLoginPassword(e.target.value)} />
        <button type="submit">Log In</button>
      </form>
      <p>{loginMessage}</p>

      <p>Current User: {userEmail || "None"}</p>
    </main>
  );
}
// update
