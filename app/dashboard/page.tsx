"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const supabase = createClient();
  const router = useRouter();

  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/"); // 로그인 안하면 홈으로
      } else {
        setUserEmail(data.user.email || "");
      }
    };

    checkUser();
  }, [supabase, router]);

  return (
    <main style={{ padding: 20 }}>
      <h1>Dashboard</h1>
      <p>Welcome: {userEmail}</p>
    </main>
  );
}