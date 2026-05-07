"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, LoaderCircle } from "lucide-react";

type PushConfig = {
  enabled?: boolean;
  publicKey?: string | null;
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export default function PushNotificationButton({
  showLabel = false,
  variant = "pill",
  onEnabled,
  onSkipped,
}: {
  showLabel?: boolean;
  variant?: "pill" | "toggle" | "choice";
  onEnabled?: () => void;
  onSkipped?: () => void;
}) {
  const [supported, setSupported] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [publicKey, setPublicKey] = useState("");
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      return;
    }

    let active = true;
    setSupported(true);
    setPermission(Notification.permission);

    const loadState = async () => {
      try {
        const response = await fetch("/api/push/config", { cache: "no-store" });
        const config = (await response.json()) as PushConfig;
        if (!active) return;

        setConfigured(Boolean(config.enabled && config.publicKey));
        setPublicKey(config.publicKey || "");

        const registration = await navigator.serviceWorker.register("/sw.js");
        const existing = await registration.pushManager.getSubscription();
        if (!active) return;

        if (existing) {
          await fetch("/api/push/subscriptions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ subscription: existing.toJSON() }),
          }).catch((error) => {
            console.error("[push-button] subscription sync failed", error);
          });
        }

        setSubscribed(Boolean(existing));
      } catch (error) {
        console.error("[push-button] state load failed", error);
      }
    };

    void loadState();

    return () => {
      active = false;
    };
  }, []);

  if (!supported || !configured) {
    if (variant === "choice") {
      return (
        <div className="space-y-3">
          <p className="text-sm font-medium text-[#728089]">
            Notifications are not available in this browser right now.
          </p>
          <button
            type="button"
            onClick={onSkipped}
            className="inline-flex items-center justify-center rounded-full border border-[#dce4e9] bg-[linear-gradient(180deg,#ffffff_0%,#f4f7f9_100%)] px-5 py-3 text-sm font-medium text-[#5d6b74] transition hover:bg-[#f7fafb] hover:text-[#2f3f48]"
          >
            Continue to Neonadri
          </button>
        </div>
      );
    }

    return null;
  }

  const enableNotifications = async () => {
    if (busy) return false;
    setBusy(true);
    setMessage("");

    try {
      const nextPermission =
        Notification.permission === "default"
          ? await Notification.requestPermission()
          : Notification.permission;
      setPermission(nextPermission);

      if (nextPermission !== "granted") {
        return false;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }));

      const response = await fetch("/api/push/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });

      if (!response.ok) {
        throw new Error("SUBSCRIPTION_SAVE_FAILED");
      }

      setSubscribed(true);
      setMessage("Alerts on");
      onEnabled?.();
      return true;
    } catch (error) {
      console.error("[push-button] enable failed", error);
      setMessage("Could not turn on alerts");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const disableNotifications = async () => {
    if (busy) return false;
    setBusy(true);
    setMessage("");

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration?.pushManager.getSubscription();

      if (subscription) {
        await fetch("/api/push/subscriptions", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        }).catch(() => {});
        await subscription.unsubscribe();
      }

      setSubscribed(false);
      setMessage("Alerts off");
      return true;
    } catch (error) {
      console.error("[push-button] disable failed", error);
      setMessage("Could not turn off alerts");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const denied = permission === "denied";
  const label = denied
    ? "Notifications blocked"
    : subscribed
    ? "Notifications on"
    : "Turn on notifications";

  if (variant === "choice") {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              if (subscribed) {
                onEnabled?.();
                return;
              }
              void enableNotifications();
            }}
            disabled={busy || denied}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#bac7d0] bg-[linear-gradient(180deg,#ffffff_0%,#dce6ec_100%)] px-5 py-3 text-sm font-bold text-[#24323c] shadow-[0_16px_30px_rgba(118,126,133,0.18),inset_0_1px_0_rgba(255,255,255,0.98)] transition hover:border-[#a8b8c2] hover:text-[#17242d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
            {subscribed ? "Yes, continue with alerts on" : "Yes, turn on alerts"}
          </button>
          <button
            type="button"
            onClick={onSkipped}
            disabled={busy}
            className="inline-flex items-center justify-center rounded-full border border-[#dce4e9] bg-[linear-gradient(180deg,#ffffff_0%,#f4f7f9_100%)] px-5 py-3 text-sm font-medium text-[#5d6b74] transition hover:bg-[#f7fafb] hover:text-[#2f3f48] disabled:cursor-not-allowed disabled:opacity-60"
          >
            No, continue
          </button>
        </div>
        {denied ? (
          <p className="text-xs font-medium text-[#728089]">
            Notifications are blocked in this browser.
          </p>
        ) : null}
        {message ? (
          <p className="text-xs font-medium text-[#728089]">{message}</p>
        ) : null}
      </div>
    );
  }

  if (variant === "toggle") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-[#24323c]">
            Device notifications
          </div>
          <div className="mt-1 text-xs font-medium text-[#728089]">
            {denied
              ? "Blocked in this browser"
              : subscribed
              ? "Alerts are on for this device"
              : "Alerts are off for this device"}
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={subscribed}
          onClick={subscribed ? disableNotifications : enableNotifications}
          disabled={busy || denied}
          className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-60 ${
            subscribed
              ? "border-[#b8c6cf] bg-[linear-gradient(180deg,#dce7ed_0%,#aebdc7_100%)]"
              : "border-[#d9e2e8] bg-[linear-gradient(180deg,#ffffff_0%,#edf2f5_100%)]"
          }`}
          title={label}
          aria-label={label}
        >
          <span
            className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#64727a] shadow-[0_6px_14px_rgba(118,126,133,0.22)] transition ${
              subscribed ? "translate-x-7" : "translate-x-1"
            }`}
          >
            {busy ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            ) : subscribed ? (
              <Bell className="h-3.5 w-3.5" />
            ) : (
              <BellOff className="h-3.5 w-3.5" />
            )}
          </span>
        </button>
        {message ? (
          <div className="w-full text-xs font-medium text-[#728089]">{message}</div>
        ) : null}
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={subscribed ? disableNotifications : enableNotifications}
        disabled={busy || denied}
        className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-xs font-medium text-[#728089] transition hover:bg-[#eef4f7] hover:text-[#33434c] disabled:cursor-not-allowed disabled:opacity-60"
        title={label}
        aria-label={label}
      >
        {busy ? (
          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
        ) : subscribed ? (
          <Bell className="h-3.5 w-3.5" />
        ) : (
          <BellOff className="h-3.5 w-3.5" />
        )}
        <span className={showLabel ? "inline" : "hidden lg:inline"}>
          {subscribed ? "Alerts on" : "Alerts"}
        </span>
      </button>

      {message ? (
        <span className="text-xs font-medium text-[#728089]">{message}</span>
      ) : null}
    </span>
  );
}
