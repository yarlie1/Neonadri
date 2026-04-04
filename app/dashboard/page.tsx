"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Dashboard() {
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserEmail(user.email!);

        // 👉 profiles 테이블에서 이름 가져오기
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (data) {
          setName(data.full_name);
        }
      }
    };

    getUser();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome: {userEmail}</p>

      {name && <p>Name: {name}</p>}
    </div>
  );
}