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
}: {
  showLabel?: boolean;
}) {
  const [supported, setSupported] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [publicKey, setPublicKey] = useState("");
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

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
    return null;
  }

  const enableNotifications = async () => {
    if (busy) return;
    setBusy(true);

    try {
      const nextPermission =
        Notification.permission === "default"
          ? await Notification.requestPermission()
          : Notification.permission;
      setPermission(nextPermission);

      if (nextPermission !== "granted") {
        return;
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
    } catch (error) {
      console.error("[push-button] enable failed", error);
    } finally {
      setBusy(false);
    }
  };

  const disableNotifications = async () => {
    if (busy) return;
    setBusy(true);

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
    } catch (error) {
      console.error("[push-button] disable failed", error);
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

  return (
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
  );
}
