"use client";

import { useState } from "react";

export default function LaunchRewardClaimBox({
  postId,
  initialClaimStatus,
}: {
  postId: number;
  initialClaimStatus?: string | null;
}) {
  const [claiming, setClaiming] = useState(false);
  const [claimOpened, setClaimOpened] = useState(initialClaimStatus === "reserved");
  const [mailto, setMailto] = useState("");
  const [message, setMessage] = useState("");

  const claimAlreadyComplete =
    initialClaimStatus === "approved" || initialClaimStatus === "reward_sent";
  const showCompactClaimState = claimOpened || claimAlreadyComplete;

  const openClaimEmail = async () => {
    if (mailto) {
      window.location.href = mailto;
      return;
    }

    setClaiming(true);
    setMessage("");

    try {
      const response = await fetch("/api/reward/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Could not open this reward claim right now.");
        return;
      }

      if (result.mailto) {
        setMailto(result.mailto);
        setClaimOpened(true);
        window.location.href = result.mailto;
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setClaiming(false);
    }
  };

  if (showCompactClaimState) {
    return (
      <div className="rounded-[8px] border border-[#111111] bg-white px-4 py-3 text-sm font-semibold leading-6 text-[#333333]">
        <div className="mb-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#111111]">
          Launch Reward Claim
        </div>
        {claimAlreadyComplete ? (
          "Your Launch Reward claim has been received."
        ) : (
          <>
            If you already sent the reward claim email, you are all set. If you closed it,{" "}
            <button
              type="button"
              onClick={openClaimEmail}
              disabled={claiming}
              className="font-black text-[#111111] underline underline-offset-4 disabled:opacity-50"
            >
              {claiming ? "opening..." : "click here"}
            </button>
            . After review, eligible rewards are sent through Tremendous.
          </>
        )}
        {message ? <span className="block text-[#555555]">{message}</span> : null}
      </div>
    );
  }

  return (
    <div className="rounded-[8px] border border-[#111111] bg-white p-5 text-[#111111] shadow-none">
      <div className="text-[11px] font-black uppercase tracking-[0.14em]">
        Launch Reward
      </div>
      <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
        Claim your $10 reward
      </h2>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#333333]">
        First 100 eligible participants. Feedback is optional.
      </p>
      <button
        type="button"
        onClick={openClaimEmail}
        disabled={claiming}
        style={{ color: "#ffffff" }}
        className="mt-4 inline-flex w-full items-center justify-center rounded-[8px] border border-[#111111] bg-[#111111] px-5 py-3 text-sm font-black transition hover:bg-[#333333] disabled:opacity-50 sm:w-auto"
      >
        {claiming ? "Checking..." : "Claim $10 Reward"}
      </button>
      {message ? (
        <p className="mt-3 text-sm font-semibold leading-6 text-[#555555]">
          {message}
        </p>
      ) : null}
    </div>
  );
}