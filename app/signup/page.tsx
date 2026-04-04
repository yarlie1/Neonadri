"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async () => {
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data?.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: name,
      });
    }

    setMessage("Signup successful.");

    router.push("/login");
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>Sign Up</h1>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br />
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />

      <button onClick={handleSignup}>Sign Up</button>

      {message && <p>{message}</p>}

      <div style={{ marginTop: 20 }}>
        <a href="/">
          <button>Back to Home</button>
        </a>
      </div>
    </main>
  );
}