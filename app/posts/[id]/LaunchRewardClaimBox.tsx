"use client";

import { useState } from "react";

export default function LaunchRewardClaimBox({
  postId,
  initialClaimStatus,
  availabilityMessage,
}: {
  postId: number;
  initialClaimStatus?: string | null;
  availabilityMessage: string;
}) {
  const [claiming, setClaiming] = useState(false);
  const [claimOpened, setClaimOpened] = useState(initialClaimStatus === "reserved");
  const [mailto, setMailto] = useState("");
  const [message, setMessage] = useState("");

  const claimAlreadyComplete =
    initialClaimStatus === "approved" || initialClaimStatus === "reward_sent";
  const showCompactClaimState = claimOpened || claimAlreadyComplete;

  const [copyStatus, setCopyStatus] = useState("");
  const emailUrl = mailto ? new URL(mailto) : null;
  const recipient = emailUrl ? decodeURIComponent(emailUrl.pathname) : "";
  const subject = emailUrl?.searchParams.get("subject") || "";
  const body = emailUrl?.searchParams.get("body") || "";

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(label + " copied. Paste it into your email.");
    } catch {
      setCopyStatus("Could not copy automatically. Select and copy the text below.");
    }
  };

  const emailDetails = mailto ? (
    <div className="mt-4 space-y-3 border-t border-[#dddddd] pt-4">
      <p className="text-sm leading-6">
        Use Gmail, Outlook, or any email service. Copy the details below, paste them
        into a new email, and send it. Copying does not send your claim.
      </p>
      {[
        { label: "To", value: recipient },
        { label: "Subject", value: subject },
        { label: "Message", value: body },
      ].map(({ label, value }) => (
        <div key={label}>
          <div className="mb-1 flex items-center justify-between gap-3">
            <label htmlFor={`claim-${postId}-${label}`} className="text-sm font-bold">
              {label}
            </label>
            <button type="button" onClick={() => copyText(value, label)}
              className="text-sm font-bold underline underline-offset-4">
              Copy {label === "To" ? "email address" : label.toLowerCase()}
            </button>
          </div>
          {label === "Message" ? (
            <textarea id={`claim-${postId}-${label}`} readOnly value={value} rows={10}
              className="w-full rounded-[8px] border border-[#cccccc] bg-white p-3 text-sm font-normal" />
          ) : (
            <input id={`claim-${postId}-${label}`} readOnly value={value}
              className="w-full rounded-[8px] border border-[#cccccc] bg-white p-3 text-sm font-normal" />
          )}
        </div>
      ))}
      <p role="status" className="text-sm">{copyStatus}</p>
      <a href={mailto} className="inline-block text-sm font-bold underline underline-offset-4">
        Open in mail app instead
      </a>
    </div>
  ) : null;

  const openClaimEmail = async () => {
    if (mailto) {
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
        setMessage(result.error || "Could not prepare this reward claim right now.");
        return;
      }

      if (typeof result.mailto === "string" && result.mailto.startsWith("mailto:")) {
        setMailto(result.mailto);
        setClaimOpened(true);
      } else {
        setMessage("Could not prepare the email details. Please try again.");
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
            If you already sent the reward claim email, you are all set. If you have not sent it yet,{" "}
            <button
              type="button"
              onClick={openClaimEmail}
              disabled={claiming}
              className="font-black text-[#111111] underline underline-offset-4 disabled:opacity-50"
            >
              {claiming ? "Loading..." : "view email details"}
            </button>
            . After review, eligible rewards are sent through Tango. Look for an email from Tango Card, and check your Promotions or Spam folder if you don’t see it.
          </>
        )}
        {!claimAlreadyComplete ? emailDetails : null}
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
        {availabilityMessage} Feedback is optional.
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