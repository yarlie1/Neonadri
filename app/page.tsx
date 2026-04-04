"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

type Post = {
  id: number;
  title: string;
  content: string;
  created_at: string;
};

export default function HomePage() {
  const supabase = createClient();
  const router = useRouter();

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupMessage, setSignupMessage] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data.user?.email ?? "");
    };

    const loadPosts = async () => {
      const { data } = await supabase
        .from("posts")
        .select("id, title, content, created_at")
        .order("created_at", { ascending: false });

      setPosts(data || []);
    };

    loadUser();
    loadPosts();

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

    const { data, error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: { full_name: signupName },
      },
    });

    if (error) {
      setSignupMessage(error.message);
      return;
    }

    if (data?.user) {
      await supabase.from("profiles").upsert([
        {
          id: data.user.id,
          full_name: signupName,
        },
      ]);
    }

    setSignupMessage("Signup successful. Check your email.");
    setSignupName("");
    setSignupEmail("");
    setSignupPassword("");
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      setLoginMessage(error.message);
    } else {
      setLoginMessage("Logged in successfully.");
      setLoginEmail("");
      setLoginPassword("");
      router.push("/dashboard");
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setLoginMessage(error.message);
    } else {
      setLoginMessage("Logged out successfully.");
    }
  };

  return (
    <main style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ fontSize: 42, marginBottom: 12 }}>Neonadri</h1>

      <p style={{ fontSize: 20, color: "#555", marginBottom: 30 }}>
        Do you want to meet someone? Try Neonadri.
      </p>

      {userEmail ? (
        <>
          <button onClick={handleLogout}>Log Out</button>
          <p style={{ marginTop: 10 }}>Logged in as: {userEmail}</p>

          <div style={{ marginTop: 16, marginBottom: 40 }}>
            <a href="/dashboard">
              <button>Go to Dashboard</button>
            </a>
          </div>
        </>
      ) : (
        <>
          <h2>Sign Up</h2>
          <form onSubmit={handleSignup}>
            <input
              placeholder="Name"
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
            />
            <br />
            <input
              placeholder="Email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
            />
            <br />
            <input
              placeholder="Password"
              type="password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
            />
            <br />
            <button type="submit">Sign Up</button>
          </form>
          <p>{signupMessage}</p>

          <h2>Log In</h2>
          <form onSubmit={handleLogin}>
            <input
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <br />
            <input
              placeholder="Password"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
            <br />
            <button type="submit">Log In</button>
          </form>

          {loginMessage && <p>{loginMessage}</p>}
        </>
      )}

      <div style={{ marginTop: 50 }}>
        <h2>Recent Posts</h2>

        {posts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              style={{
                border: "1px solid #ccc",
                padding: 16,
                marginBottom: 16,
                borderRadius: 8,
              }}
            >
              <h3 style={{ marginBottom: 8 }}>
                <a
                  href={`/posts/${post.id}`}
                  style={{ color: "black", textDecoration: "none" }}
                >
                  {post.title}
                </a>
              </h3>

              <p style={{ marginBottom: 8 }}>{post.content}</p>

              <small>{new Date(post.created_at).toLocaleString()}</small>
            </div>
          ))
        )}
      </div>
    </main>
  );
}