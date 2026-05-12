import {
  ArrowRight,
  CalendarClock,
  ChevronDown,
  CircleDollarSign,
  Coffee,
  Gamepad2,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Utensils,
  UserRound,
} from "lucide-react";

const meetups = [
  {
    icon: Gamepad2,
    title: "Board Games",
    host: "SJ",
    meta: "Male / 40s",
    date: "May 30",
    time: "1:30 PM",
    place: "Next-Gen Games",
    audience: "Any / Any",
    amount: "$50",
    status: "Open",
    tone: "border-[#2f9e8f] bg-[#e8fbf6] text-[#087466]",
  },
  {
    icon: Utensils,
    title: "Lunch",
    host: "Chae",
    meta: "Male / 40s",
    date: "May 13",
    time: "12:00 PM",
    place: "Moonlark's Dinette",
    audience: "Female / Any",
    amount: "$50",
    status: "Featured",
    tone: "border-[#f0a04b] bg-[#fff3df] text-[#9a5510]",
  },
  {
    icon: Coffee,
    title: "Coffee",
    host: "Mina",
    meta: "Female / 30s",
    date: "May 22",
    time: "3:00 PM",
    place: "Verve Coffee Roasters",
    audience: "Any / 30s",
    amount: "$30",
    status: "Open",
    tone: "border-[#2f9e8f] bg-[#e8fbf6] text-[#087466]",
  },
];

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-[8px] border border-[#d9e1dd] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(29,46,50,0.06)]">
      <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#69736f]">
        {label}
      </div>
      <div className="mt-1 text-3xl font-black leading-none tracking-[-0.03em] text-[#172426]">
        {value}
      </div>
      <div className="mt-1 text-sm text-[#66716d]">{note}</div>
    </div>
  );
}

function MeetupCard({
  meetup,
}: {
  meetup: (typeof meetups)[number];
}) {
  const Icon = meetup.icon;

  return (
    <article className="group rounded-[8px] border border-[#d8e1dc] bg-white p-4 shadow-[0_16px_36px_rgba(23,36,38,0.08)] transition hover:-translate-y-0.5 hover:border-[#b7c7c0] hover:shadow-[0_22px_48px_rgba(23,36,38,0.12)]">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] bg-[#f0f5f2] text-[#172426]">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-2xl font-black leading-none tracking-[-0.02em] text-[#172426]">
                {meetup.title}
              </h3>
              <p className="mt-1 text-sm text-[#6f7975]">
                Hosted by <span className="font-semibold text-[#34413e]">{meetup.host}</span> | {meetup.meta}
              </p>
            </div>

            <span
              className={`rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] ${meetup.tone}`}
            >
              {meetup.status}
            </span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-[1.1fr_1.35fr_0.9fr]">
            <div className="flex items-center gap-2 rounded-[8px] bg-[#f6f8f5] px-3 py-2 text-sm text-[#34413e]">
              <CalendarClock className="h-4 w-4 text-[#6d7a75]" />
              <span>
                <strong>{meetup.date}</strong> {meetup.time}
              </span>
            </div>
            <div className="flex min-w-0 items-center gap-2 rounded-[8px] bg-[#f6f8f5] px-3 py-2 text-sm text-[#34413e]">
              <MapPin className="h-4 w-4 shrink-0 text-[#6d7a75]" />
              <span className="truncate font-semibold">{meetup.place}</span>
            </div>
            <div className="flex items-center gap-2 rounded-[8px] bg-[#f6f8f5] px-3 py-2 text-sm text-[#34413e]">
              <UserRound className="h-4 w-4 text-[#6d7a75]" />
              <span>{meetup.audience}</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1ee] pt-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#172426] px-3 py-1.5 text-sm font-bold text-white">
              <CircleDollarSign className="h-4 w-4 text-[#ffd166]" />
              Host covers {meetup.amount}
            </div>
            <button className="inline-flex items-center gap-2 rounded-full bg-[#ff6f61] px-4 py-2 text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(255,111,97,0.24)] transition group-hover:bg-[#f45d50]">
              View details
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function DesignConceptPage() {
  return (
    <main className="min-h-screen bg-[#eef3ef] text-[#172426]">
      <section className="border-b border-[#d9e2dd] bg-[#fbfcf8]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-[#172426] text-white">
              <Sparkles className="h-5 w-5 text-[#9af0d0]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-[-0.04em]">Neonadri</span>
                <span className="rounded-full bg-[#e8fbf6] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#087466]">
                  Beta
                </span>
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#73817b]">
                1:1 social meetups
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {["Home", "Dashboard", "Profile", "Account"].map((item) => (
              <button
                key={item}
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  item === "Home"
                    ? "bg-[#172426] text-white"
                    : "border border-[#d7e0db] bg-white text-[#34413e]"
                }`}
              >
                {item}
              </button>
            ))}
            <button className="inline-flex items-center gap-2 rounded-full bg-[#ff6f61] px-4 py-2 text-sm font-extrabold text-white">
              <Plus className="h-4 w-4" />
              Create
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-[8px] border border-[#cfdad4] bg-[#172426] text-white shadow-[0_24px_60px_rgba(23,36,38,0.22)]">
            <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="p-7 sm:p-9">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#b8f5df]">
                  <ShieldCheck className="h-4 w-4" />
                  No dating pressure
                </div>

                <h1 className="mt-5 max-w-2xl text-5xl font-black leading-[0.95] tracking-[-0.04em] sm:text-6xl">
                  Meet someone new over a real plan.
                </h1>

                <p className="mt-5 max-w-xl text-lg leading-8 text-[#d9e5df]">
                  Hosts cover the listed activity cost. Guests show up, join the plan, and decide after one simple meetup.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button className="inline-flex items-center gap-2 rounded-full bg-[#ff6f61] px-5 py-3 text-sm font-extrabold text-white shadow-[0_14px_32px_rgba(255,111,97,0.28)]">
                    Browse meetups
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white">
                    Watch intro
                  </button>
                </div>
              </div>

              <div className="border-t border-white/10 bg-[#223436] p-5 lg:border-l lg:border-t-0">
                <div className="grid h-full content-end gap-3">
                  <Stat label="Plans" value="11" note="near Los Angeles" />
                  <Stat label="Hosts" value="4" note="with open plans" />
                  <Stat label="Mode" value="1:1" note="social, not dating" />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[8px] border border-[#d8e1dc] bg-white p-4 shadow-[0_14px_36px_rgba(23,36,38,0.07)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-black text-[#172426]">
                  <SlidersHorizontal className="h-4 w-4 text-[#ff6f61]" />
                  Refine your view
                </div>
                <p className="mt-1 text-sm text-[#6f7975]">
                  Open meetups near you, sorted by soonest
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {["Open", "Nearby", "This week"].map((item) => (
                  <button
                    key={item}
                    className="rounded-full border border-[#d8e1dc] bg-[#f6f8f5] px-3 py-2 text-sm font-bold text-[#34413e]"
                  >
                    {item}
                  </button>
                ))}
                <button className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#172426] text-white">
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ff6f61]">
                  Discover
                </p>
                <h2 className="mt-1 text-3xl font-black tracking-[-0.03em] text-[#172426]">
                  Nearby meetups
                </h2>
              </div>
              <span className="rounded-full border border-[#d8e1dc] bg-white px-3 py-1.5 text-sm font-bold text-[#66716d]">
                11 results
              </span>
            </div>

            <div className="space-y-4">
              {meetups.map((meetup) => (
                <MeetupCard key={`${meetup.title}-${meetup.place}`} meetup={meetup} />
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-[8px] border border-[#d8e1dc] bg-white p-5 shadow-[0_16px_36px_rgba(23,36,38,0.08)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ff6f61]">
                  Featured
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.03em]">
                  Lunch at Moonlark's
                </h2>
              </div>
              <span className="rounded-full bg-[#fff3df] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[#9a5510]">
                Open
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-[#66716d]">
              A casual daytime meal. The host covers up to $50 for food, tickets, or transport.
            </p>

            <div className="mt-5 grid gap-2">
              {[
                ["When", "May 13, 12:00 PM"],
                ["Place", "Moonlark's Dinette"],
                ["Guest", "Female / Any"],
                ["Near you", "0.9 mi away"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 rounded-[8px] bg-[#f6f8f5] px-3 py-3"
                >
                  <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#7b8681]">
                    {label}
                  </span>
                  <span className="text-right text-sm font-extrabold text-[#172426]">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#172426] px-5 py-3 text-sm font-extrabold text-white">
              Request to join
              <ArrowRight className="h-4 w-4" />
            </button>
          </section>

          <section className="rounded-[8px] border border-[#d8e1dc] bg-[#fbfcf8] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#e8fbf6] text-[#087466]">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-[#172426]">Why this feels sharper</h3>
                <p className="mt-1 text-sm leading-6 text-[#66716d]">
                  Higher contrast, fewer nested boxes, clearer badges, and one warm action color.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
