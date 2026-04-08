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

type DashboardTab = "posts" | "received" | "sent" | "matches";

const supabase = createClient();

function DashboardTabCard({
  active,
  label,
  value,
  subtext,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  value: number;
  subtext?: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-[26px] border px-4 py-4 text-left transition duration-200 ${
        active
          ? "border-[#b29d87] bg-[#a48f7a] text-white shadow-[0_10px_24px_rgba(80,60,40,0.18)]"
          : "border-[#e7ddd2] bg-white text-[#2f2a26] hover:bg-[#fcfaf7] hover:shadow-md"
      }`}
    >
      <div className="flex min-h-[112px] flex-col justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold">{label}</span>
        </div>

        <div>
          <div className="text-[38px] font-extrabold leading-none">
            {value}
          </div>

          <div className="mt-2 text-xs opacity-80">
            {subtext || ""}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("posts");
  const [showSuccess, setShowSuccess] = useState(false);

  const [posts, setPosts] = useState<any[]>([]);
  const [requestsReceived, setRequestsReceived] = useState<any[]>([]);
  const [requestsSent, setRequestsSent] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);

  const [userId, setUserId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");

    if (success === "1") {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUserId(user.id);

      const [p, r1, r2, m] = await Promise.all([
        supabase.from("posts").select("*").eq("user_id", user.id),
        supabase.from("match_requests").select("*").eq("post_owner_user_id", user.id),
        supabase.from("match_requests").select("*").eq("requester_user_id", user.id),
        supabase.from("matches").select("*"),
      ]);

      setPosts(p.data || []);
      setRequestsReceived(r1.data || []);
      setRequestsSent(r2.data || []);
      setMatches(m.data || []);
    };

    load();
  }, []);

  const pendingReceived = useMemo(
    () => requestsReceived.filter((r) => r.status === "pending").length,
    [requestsReceived]
  );

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-4 py-6">
      <div className="mx-auto max-w-2xl space-y-5">

        {showSuccess && (
          <div className="rounded-xl bg-[#efe7dc] px-4 py-3 text-sm shadow">
            Match created successfully 🎉
          </div>
        )}

        {/* HEADER */}
        <div className="rounded-3xl bg-[#fffaf5] p-5 shadow">
          <div className="text-xs text-[#9b8f84]">DASHBOARD</div>

          <div className="flex justify-between items-center mt-2">
            <div>
              <h1 className="text-3xl font-bold">My Meetups</h1>
              <p className="text-sm text-[#6f655c]">
                Manage posts, requests, and matches.
              </p>
            </div>

            <Link
              href="/write"
              className="bg-[#a48f7a] text-white px-4 py-2 rounded-full"
            >
              + Create
            </Link>
          </div>
        </div>

        {/* ✅ 통합 카드 */}
        <div className="grid grid-cols-2 gap-4">
          <DashboardTabCard
            active={activeTab === "posts"}
            label="My Posts"
            value={posts.length}
            icon={<FileText className="h-4 w-4" />}
            onClick={() => setActiveTab("posts")}
          />

          <DashboardTabCard
            active={activeTab === "received"}
            label="Requests Received"
            value={requestsReceived.length}
            subtext={
              pendingReceived > 0
                ? `${pendingReceived} pending`
                : "No pending"
            }
            icon={<Inbox className="h-4 w-4" />}
            onClick={() => setActiveTab("received")}
          />

          <DashboardTabCard
            active={activeTab === "sent"}
            label="Requests Sent"
            value={requestsSent.length}
            icon={<Send className="h-4 w-4" />}
            onClick={() => setActiveTab("sent")}
          />

          <DashboardTabCard
            active={activeTab === "matches"}
            label="Matches"
            value={matches.length}
            icon={<HeartHandshake className="h-4 w-4" />}
            onClick={() => setActiveTab("matches")}
          />
        </div>

        {/* CONTENT */}
        <div className="rounded-3xl bg-white p-5 shadow text-sm">
          {activeTab === "posts" && "My posts list..."}
          {activeTab === "received" && "Received requests..."}
          {activeTab === "sent" && "Sent requests..."}
          {activeTab === "matches" && "Matches list..."}
        </div>
      </div>
    </main>
  );
}