"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ActivityItem } from "../../../lib/adminActivity";
import { APP_SURFACE_CARD_CLASS, APP_BUTTON_SECONDARY_CLASS } from "../../designSystem";

function Person({ person }: { person: ActivityItem["actor"] }) {
  return person.href ? <Link href={person.href} className="font-semibold underline underline-offset-4">{person.name}</Link> : <span>{person.name}</span>;
}

export default function LatestActivity({ items, error }: { items: ActivityItem[]; error: boolean }) {
  const [visible, setVisible] = useState(10);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <section className={APP_SURFACE_CARD_CLASS + " p-5 sm:p-6"} aria-labelledby="latest-activity-heading">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="latest-activity-heading" className="text-xl font-black text-[#24323c]">Latest Activity</h2>
          <p className="mt-2 text-sm text-[#6c7880]">Latest 50 activities · Pacific Time</p>
        </div>
        <button type="button" disabled={pending} onClick={() => startTransition(() => router.refresh())} className={APP_BUTTON_SECONDARY_CLASS + " rounded-full px-4 py-2 text-sm disabled:opacity-50"}>
          {pending ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      {error ? <p role="alert" className="mt-4 text-sm">Could not load activity. Please refresh to try again.</p>
        : items.length === 0 ? <p className="mt-4 text-sm text-[#6c7880]">No activity yet.</p>
        : <ol className="mt-4 divide-y divide-[#dce5eb]">
          {items.slice(0, visible).map((item) => (
            <li key={item.id} className="py-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded border border-[#dce5eb] px-2 py-1 text-xs font-semibold">{item.kind}</span>
                <time dateTime={item.createdAt} className="text-xs text-[#6c7880]">
                  {new Date(item.createdAt).toLocaleString("en-US", { timeZone: "America/Los_Angeles", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                </time>
              </div>
              <p className="mt-2 break-words leading-6">
                <Person person={item.actor} />{" "}
                {item.kind === "Signup" ? "signed up." : item.kind === "Post" ? "posted a meetup." : item.kind === "Request" ? <>requested to join {item.other && <Person person={item.other} />}&apos;s meetup.</> : <>accepted {item.other && <Person person={item.other} />}&apos;s request.</>}
              </p>
              {item.post && <Link href={item.post.href} className="mt-1 inline-block break-words text-[#5f6c75] underline underline-offset-4">{item.post.name}</Link>}
            </li>
          ))}
        </ol>}
      {!error && visible < items.length && <button type="button" onClick={() => setVisible((count) => count + 10)} className={APP_BUTTON_SECONDARY_CLASS + " mt-3 rounded-full px-4 py-2 text-sm"}>Show more</button>}
      <p className="mt-4 text-xs text-[#6c7880]">Based on existing records. Deleted requests and accounts are not retained in this list.</p>
    </section>
  );
}
