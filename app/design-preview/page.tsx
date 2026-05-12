import {
  Bell,
  Coffee,
  Dice5,
  DollarSign,
  ForkKnife,
  Home,
  MapPin,
  MessageCircle,
  Navigation,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trees,
  User,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";

const colors = [
  ["Brand Navy", "#08245C"],
  ["Brand Blue", "#3157D6"],
  ["Action Red", "#C51622"],
  ["Icon Cream", "#F7EFE3"],
  ["Text", "#111318"],
  ["Muted", "#5F6877"],
  ["Border", "#D9E0EA"],
  ["Surface", "#FFFFFF"],
];

const categories = [
  { label: "All", active: true },
  { label: "Food", icon: ForkKnife },
  { label: "Games", icon: Dice5 },
  { label: "Coffee", icon: Coffee },
  { label: "Outdoors", icon: Trees },
];

const meetups = [
  {
    section: "Today",
    count: "2 meetups",
    items: [
      {
        title: "Lunch",
        venue: "Moonlark's Dinette",
        host: "Hosted by Chae | Male / 40s",
        meta: "May 13 - 12:00 PM - Female / Any",
        icon: ForkKnife,
      },
      {
        title: "Board Games",
        venue: "Next-Gen Games",
        host: "Hosted by S J | Male / 40s",
        meta: "May 13 - 1:30 PM - Any / Any",
        icon: Dice5,
      },
    ],
  },
  {
    section: "Later this week",
    count: "3 meetups",
    items: [
      {
        title: "Coffee",
        venue: "Verve Coffee Roasters",
        host: "Hosted by Mina | Female / 30s",
        meta: "May 14 - 3:00 PM - Any / Any",
        icon: Coffee,
      },
      {
        title: "Walk & Talk",
        venue: "Griffith Park Trails",
        host: "Hosted by S J | Male / 40s",
        meta: "May 15 - 10:00 AM - Any / Any",
        icon: Trees,
      },
    ],
  },
];

function Logo() {
  return (
    <div className="relative flex h-[43px] w-[43px] items-center justify-center rounded-lg border border-[#f7efe3] bg-[#08245c] text-[28px] font-extrabold leading-none text-[#f7efe3] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16),0_2px_7px_rgba(8,36,92,0.24)]">
      N
      <Sparkles className="absolute right-[5px] top-[5px] h-3 w-3" />
    </div>
  );
}

function IconTile({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="relative grid h-[58px] w-[58px] shrink-0 place-items-center rounded-lg border border-[#f7efe3] bg-[#08245c] text-[#f7efe3] shadow-[0_2px_6px_rgba(8,36,92,0.22)]">
      <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#c51622]" />
      <Icon className="h-8 w-8 stroke-[1.9]" />
    </div>
  );
}

function FilterPill({
  label,
  active,
  icon: Icon,
}: {
  label: string;
  active?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <button
      type="button"
      className={[
        "inline-flex h-[34px] shrink-0 items-center justify-center gap-2 rounded-[10px] border px-3 text-[12px] font-bold",
        active
          ? "border-[#c51622] bg-[#c51622] text-white shadow-[0_2px_7px_rgba(197,22,34,0.24)]"
          : "border-[#d9e0ea] bg-white text-[#111318]",
      ].join(" ")}
    >
      {active ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
      {Icon ? <Icon className="h-[17px] w-[17px] text-[#08245c]" /> : null}
      {label}
    </button>
  );
}

function EventCard({
  title,
  venue,
  host,
  meta,
  icon,
}: {
  title: string;
  venue: string;
  host: string;
  meta: string;
  icon: LucideIcon;
}) {
  return (
    <article className="grid grid-cols-[58px_1fr] gap-3 rounded-lg border border-[#d9e0ea] bg-white p-2.5 shadow-[0_1px_2px_rgba(17,19,24,0.04)]">
      <IconTile icon={icon} />
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-[17px] font-extrabold leading-tight text-[#111318]">
              {title}
            </h3>
            <p className="mt-1 flex items-center gap-1 truncate text-[11px] font-semibold text-[#111318]">
              <MapPin className="h-3 w-3 shrink-0 text-[#5f6877]" />
              {venue}
            </p>
          </div>
          <span className="rounded-full border border-[#d9e0ea] bg-[#f4f6fa] px-2.5 py-1 text-[10px] font-bold text-[#111318]">
            Open
          </span>
        </div>
        <p className="mt-1.5 truncate text-[10px] text-[#5f6877]">{host}</p>
        <div className="mt-1.5 flex min-w-0 items-center justify-between gap-2">
          <p className="truncate text-[9px] text-[#5f6877]">{meta}</p>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#f4f6fa] px-2 py-1 text-[9px] font-bold text-[#111318]">
            <span className="grid h-3 w-3 place-items-center rounded-full bg-[#111318] text-[7px] text-white">
              $
            </span>
            Host covers $50
          </span>
        </div>
      </div>
    </article>
  );
}

export default function DesignPreviewPage() {
  return (
    <main className="min-h-screen bg-[#eceff4] px-4 py-8 text-[#111318]">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[430px_1fr] lg:items-start">
        <section className="mx-auto w-full max-w-[430px] rounded-[28px] bg-[#dfe4ec] p-5 shadow-[0_18px_50px_rgba(17,19,24,0.14)]">
          <div className="mx-auto h-[844px] w-full max-w-[390px] overflow-hidden rounded-[22px] bg-[#f5f5f5] shadow-[0_12px_32px_rgba(8,36,92,0.18)]">
            <header className="flex h-[74px] items-center gap-3 bg-white px-5">
              <Logo />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[27px] font-extrabold leading-none tracking-[-0.03em] text-[#111318]">
                  Neonadri
                </div>
                <div className="mt-1 text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#3157d6]">
                  1:1 Social Meetups
                </div>
              </div>
              <button className="relative text-[#111318]" type="button">
                <Bell className="h-6 w-6" />
                <span className="absolute -right-0.5 top-0 h-2 w-2 rounded-full bg-[#c51622]" />
              </button>
              <button
                className="grid h-[42px] w-[42px] place-items-center rounded-full border border-[#d9e0ea] bg-white text-[#111318]"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <section className="mx-[18px] mt-2.5 grid grid-cols-[1fr_132px] rounded-lg border border-[#d9e0ea] bg-[#f8fbff] p-4 shadow-[0_1px_2px_rgba(8,36,92,0.05)]">
              <div>
                <h1 className="text-[29px] font-extrabold leading-[1.08] tracking-[-0.03em] text-[#111318]">
                  Real plans,
                  <br />
                  zero pressure
                </h1>
                <p className="mt-3 text-[13px] font-extrabold text-[#3157d6]">
                  Hosts cover the listed activity cost
                </p>
                <p className="mt-2 text-[12px] leading-[1.45] text-[#5f6877]">
                  Guests show up, join the plan, and enjoy good company.
                </p>
              </div>
              <div className="border-l border-[#d9e0ea] pl-3">
                {[
                  [UsersRound, "1:1 only", "Just two people"],
                  [ShieldCheck, "Safe & private", "Verified hosts"],
                  [DollarSign, "Host covers", "You show up"],
                ].map(([Icon, label, sub]) => {
                  const TrustIcon = Icon as LucideIcon;

                  return (
                    <div className="mb-3 flex gap-2 last:mb-0" key={label as string}>
                      <span className="grid h-[31px] w-[31px] shrink-0 place-items-center rounded-full border border-[#d9e0ea] bg-white text-[#08245c]">
                        <TrustIcon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-[12px] font-extrabold text-[#111318]">
                          {label as string}
                        </div>
                        <div className="truncate text-[10px] text-[#5f6877]">
                          {sub as string}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="mt-3 flex gap-2 overflow-hidden px-[18px]">
              <FilterPill label="Open" active />
              <FilterPill label="Soonest" />
              <FilterPill label="Nearby" />
              <button
                type="button"
                className="grid h-[34px] w-[48px] shrink-0 place-items-center rounded-[10px] border border-[#d9e0ea] bg-white text-[#08245c]"
              >
                <SlidersHorizontal className="h-[18px] w-[18px]" />
              </button>
            </div>

            <div className="mt-3 flex gap-2 overflow-hidden px-[18px]">
              {categories.map((category) => (
                <FilterPill key={category.label} {...category} />
              ))}
            </div>

            <div className="mt-5 space-y-5 px-[18px]">
              {meetups.map((group) => (
                <section key={group.section}>
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-[18px] font-extrabold text-[#111318]">
                      {group.section}
                    </h2>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-[#3157d6]">
                      {group.count}
                      <span className="text-[22px] leading-none text-[#111318]">
                        &gt;
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {group.items.map((item) => (
                      <EventCard key={item.title} {...item} />
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <nav className="mt-3 grid h-[62px] grid-cols-5 border-t border-[#d9e0ea] bg-white px-2 text-[10px] font-semibold">
              {[
                [Home, "Home", true],
                [Navigation, "Discover"],
                [Plus, "Create"],
                [MessageCircle, "Chats"],
                [User, "Profile"],
              ].map(([Icon, label, active]) => {
                const NavIcon = Icon as LucideIcon;
                const isCreate = label === "Create";

                return (
                  <button
                    key={label as string}
                    type="button"
                    className="flex flex-col items-center justify-center gap-1 text-[#5f6877]"
                  >
                    {isCreate ? (
                      <span className="grid h-[38px] w-[38px] place-items-center rounded-full bg-[#08245c] text-[#f7efe3] shadow-[0_3px_10px_rgba(8,36,92,0.24)]">
                        <Plus className="h-5 w-5" />
                      </span>
                    ) : (
                      <NavIcon
                        className={[
                          "h-5 w-5",
                          active ? "fill-[#08245c] text-[#08245c]" : "text-[#08245c]",
                        ].join(" ")}
                      />
                    )}
                    <span className={active ? "text-[#08245c]" : ""}>
                      {label as string}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </section>

        <section className="rounded-2xl border border-[#d9e0ea] bg-white p-6 shadow-sm">
          <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-[#3157d6]">
            Design Preview
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-[#111318]">
            Cohesive icon-based home screen
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f6877]">
            This direction keeps the no-photo constraint and makes it feel
            intentional: icon tiles, hero card, pills, badges, and navigation all
            pull from the same brand palette.
          </p>

          <div className="mt-8">
            <h2 className="text-lg font-extrabold text-[#111318]">
              Color tokens
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {colors.map(([name, value]) => (
                <div
                  key={name}
                  className="flex items-center gap-3 rounded-lg border border-[#d9e0ea] p-3"
                >
                  <span
                    className="h-9 w-9 rounded-md border border-[#d9e0ea]"
                    style={{ backgroundColor: value }}
                  />
                  <div>
                    <div className="text-sm font-bold text-[#111318]">{name}</div>
                    <div className="text-xs text-[#5f6877]">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-[#f8fbff] p-5">
            <h2 className="text-lg font-extrabold text-[#111318]">
              What changed
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[#5f6877]">
              <li>Red is reserved for active and primary actions.</li>
              <li>Navy and cream connect the logo with every activity icon tile.</li>
              <li>Hero typography is cleaner, denser, and closer to the first reference.</li>
              <li>Badges and filter pills use one border, one surface, and one text system.</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
