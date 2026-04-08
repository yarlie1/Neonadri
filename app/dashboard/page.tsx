"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import {
  Coffee,
  UtensilsCrossed,
  CakeSlice,
  Footprints,
  PersonStanding,
  Clapperboard,
  Mic2,
  Gamepad2,
  BookOpen,
  BriefcaseBusiness,
  Book,
  Camera,
  Clock3,
  MapPin,
  UserRound,
  Coins,
  FileText,
  Inbox,
  Send,
  HeartHandshake,
  CheckCircle2,
  XCircle,
  Trash2,
  Pencil,
  Eye,
  Map as MapIcon,
  Plus,
} from "lucide-react";

const supabase = createClient();

type DashboardTab = "posts" | "received" | "sent" | "matches";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("posts");
  const [showSuccess, setShowSuccess] = useState(false);

  const [posts, setPosts] = useState<any[]>([]);
  const [requestsReceived, setRequestsReceived] = useState<any[]>([]);
  const [requestsSent, setRequestsSent] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);

  const [profileMap, setProfileMap] = useState<any>({});
  const [postMap, setPostMap] = useState<any>({});

  const [userId, setUserId] = useState("");

  // ✅ URL 읽기 (tab + success)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);

    const tab = params.get("tab");
    const success = params.get("success");

    if (tab === "posts" || tab === "received" || tab === "sent" || tab === "matches") {
      setActiveTab(tab);
    }

    if (success === "1") {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, []);

  // ✅ 데이터 로드
  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUserId(user.id);

      const [postsRes, recRes, sentRes, matchRes] = await Promise.all([
        supabase.from("posts").select("*").eq("user_id", user.id),
        supabase.from("match_requests").select("*").eq("post_owner_user_id", user.id),
        supabase.from("match_requests").select("*").eq("requester_user_id", user.id),
        supabase.from("matches").select("*"),
      ]);

      setPosts(postsRes.data || []);
      setRequestsReceived(recRes.data || []);
      setRequestsSent(sentRes.data || []);
      setMatches(matchRes.data || []);
    };

    load();
  }, []);

  // ✅ 승인 / 거절
  const updateRequestStatus = async (
    requestId: number,
    nextStatus: "accepted" | "rejected"
  ) => {
    const rpcName =
      nextStatus === "accepted"
        ? "accept_match_request"
        : "reject_match_request";

    const { data, error } = await supabase.rpc(rpcName, {
      p_request_id: requestId,
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (!data?.ok) {
      alert(data?.error || "Failed");
      return;
    }

    // ✅ 핵심 (모바일 안정 redirect)
    if (nextStatus === "accepted") {
      window.location.href = "/dashboard?tab=matches&success=1";
      return;
    }

    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-4 py-6">
      <div className="mx-auto max-w-2xl space-y-4">

        {/* ✅ 성공 배너 */}
        {showSuccess && (
          <div className="rounded-xl bg-[#efe7dc] px-4 py-3 text-sm font-medium text-[#5f5347] shadow">
            Match created successfully 🎉
          </div>
        )}

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Neonadri</h1>
          <Link href="/write" className="bg-[#a48f7a] text-white px-4 py-2 rounded-full">
            Create
          </Link>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card">My Posts {posts.length}</div>
          <div className="card">Requests {requestsReceived.length}</div>
          <div className="card">Matches {matches.length}</div>
          <div className="card">Pending {requestsReceived.filter(r=>r.status==="pending").length}</div>
        </div>

        {/* TABS */}
        <div className="flex gap-2">
          <button onClick={()=>setActiveTab("posts")}>Posts</button>
          <button onClick={()=>setActiveTab("received")}>Received</button>
          <button onClick={()=>setActiveTab("sent")}>Sent</button>
          <button onClick={()=>setActiveTab("matches")}>Matches</button>
        </div>

        {/* RECEIVED */}
        {activeTab === "received" && (
          <div className="space-y-4">
            {requestsReceived.map((item) => (
              <div key={item.id} className="card p-4">
                <div>Request received</div>
                <div>Status: {item.status}</div>

                {item.status === "pending" && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => updateRequestStatus(item.id, "accepted")}
                      className="bg-[#a48f7a] text-white px-3 py-2 rounded"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => updateRequestStatus(item.id, "rejected")}
                      className="border px-3 py-2 rounded"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* MATCHES */}
        {activeTab === "matches" && (
          <div>
            {matches.map((m) => (
              <div key={m.id} className="card p-4">
                Match #{m.id}
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}