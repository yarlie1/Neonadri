export default function HomePage() {
  const services = [
    {
      title: "Strategy",
      desc: "Clear positioning, messaging, and digital direction for brands that want a sharper online presence.",
    },
    {
      title: "Design",
      desc: "Modern, elegant website design focused on readability, trust, and visual clarity.",
    },
    {
      title: "Launch",
      desc: "A practical structure that is easy to publish, maintain, and expand over time.",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
          <div className="text-xl font-semibold tracking-tight">Neonadri</div>
          <nav className="hidden gap-8 text-sm text-slate-600 md:flex">
            <a href="#about" className="transition hover:text-slate-900">About</a>
            <a href="#services" className="transition hover:text-slate-900">Services</a>
            <a href="#contact" className="transition hover:text-slate-900">Contact</a>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:px-10 md:py-28">
        <div>
          <div className="inline-flex rounded-full border border-slate-200 px-4 py-1 text-sm text-slate-600 shadow-sm">
            Modern digital presence
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl">
            Build a polished online home for your brand.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
            Neonadri is a clean, modern homepage template that can be used for a company,
            portfolio, studio, or professional brand site.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#contact"
              className="rounded-2xl bg-slate-900 px-6 py-3 text-center text-sm font-medium text-white shadow-lg transition hover:-translate-y-0.5"
            >
              Get in Touch
            </a>
            <a
              href="#services"
              className="rounded-2xl border border-slate-300 px-6 py-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Explore Services
            </a>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm md:p-10">
          <div className="rounded-[1.5rem] border border-white bg-white p-6 shadow-sm">
            <div className="text-sm text-slate-500">Featured Message</div>
            <div className="mt-3 text-2xl font-semibold tracking-tight">
              Simple. Credible. Memorable.
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Designed to help visitors understand who you are, what you do, and how to contact you
              in just a few seconds.
            </p>
          </div>
        </div>
      </section>

      <section id="about" className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10">
          <div className="max-w-3xl">
            <div className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">About</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              A flexible homepage for real-world use.
            </h2>
            <p className="mt-6 text-base leading-7 text-slate-600">
              This layout is intentionally minimal so it can be adapted for a business introduction,
              consulting page, creative portfolio, or landing page without feeling cluttered.
            </p>
          </div>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-6xl px-6 py-20 md:px-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Services</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              What Neonadri can highlight
            </h2>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {services.map((item) => (
            <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="border-t border-slate-200 bg-slate-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-6 py-20 md:flex-row md:px-10">
          <div className="max-w-2xl">
            <div className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Contact</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Ready to turn this into a live website?
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Replace this section with your email address, inquiry form, office details, or booking link.
            </p>
          </div>
          <a
            href="mailto:hello@neonadri.net"
            className="rounded-2xl bg-white px-6 py-3 text-sm font-medium text-slate-900 shadow-lg transition hover:-translate-y-0.5"
          >
            hello@neonadri.net
          </a>
        </div>
      </section>
    </main>
  );
}
