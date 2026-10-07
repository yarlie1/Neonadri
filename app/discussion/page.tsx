import Link from "next/link";
import type { Metadata } from "next";
import DiscussionComments from "./DiscussionComments";

export const metadata: Metadata = {
 title: "Simple meetups. What do you think?",
 description: "An activity, a time, a place, and one other person. Explore Neonadri's idea and share your honest feedback. No login needed to comment.",
};
export default function DiscussionPage() {
 return <main className="mx-auto max-w-4xl px-5 py-12 text-[#111111] sm:py-20">
  <p className="text-xs font-bold uppercase tracking-[0.18em]">Neonadri · An open conversation</p>
  <h1 className="mt-6 text-5xl font-black leading-[1.02] tracking-tight sm:text-7xl">Simple meetups.<br/><span className="text-[#666666]">What do you think?</span></h1>
  <p className="mt-7 max-w-2xl text-xl leading-8">An activity. A time. A place. One other person.<br/>We’re building a simpler way to meet people in Los Angeles — and we’d like your honest opinion.</p>
  <a href="#conversation" className="mt-7 inline-block rounded-lg bg-[#111111] px-6 py-3 font-bold text-white" style={{color:"#fff"}}>Join the conversation ↓</a>
  <p className="mt-3 text-sm text-[#666666]">Read, comment, or reply. No account needed.</p>

  <section className="mt-16 border-t border-[#cccccc] pt-9">
   <h2 className="text-3xl font-black tracking-tight">What is Neonadri?</h2>
   <p className="mt-4 text-lg leading-8">A place for simple, one-on-one social meetups. Coffee, lunch, a walk, or an event you’d like to attend with someone. You don’t have to organize a group or turn it into a big occasion.</p>
   <p className="mt-4 text-lg leading-8">The idea is platonic connection, without a dating or professional networking agenda.</p>
  </section>
  <section className="mt-10 rounded-xl border border-[#111111] p-6 sm:p-8">
   <p className="text-xs font-bold uppercase tracking-widest">For example</p>
   <p className="mt-4 text-3xl font-black tracking-tight">Coffee / Saturday 2 PM / Pasadena</p>
   <p className="mt-3 text-[#666666]">An example of a plan, not a live meetup listing.</p>
   <ol className="mt-7 grid gap-6 sm:grid-cols-3">
    {[["01","Post a plan","Choose an activity, a time, and a public place."],["02","Find one person","Someone requests to join. The host accepts one guest."],["03","Meet in person","Chat to confirm the details, then meet."]].map(([n,title,body])=><li key={n}><span className="text-sm text-[#666666]">{n}</span><h3 className="mt-1 font-bold">{title}</h3><p className="mt-2 leading-6">{body}</p></li>)}
   </ol>
   <p className="mt-6 border-t border-[#dddddd] pt-5 text-sm leading-6">Meetups are for adults 18+. Choose a public place and only proceed if you feel comfortable. Posting and requesting to join require an account.</p>
  </section>
  <section className="mt-12">
   <h2 className="text-3xl font-black tracking-tight">Why we’re building it</h2>
   <p className="mt-4 text-lg leading-8">Sometimes you just want company for something you already feel like doing. We want to make that first step smaller. We’re still learning what makes people comfortable enough to take it.</p>
  </section>
  <section id="conversation" className="mt-16 scroll-mt-8 border-t border-[#111111] pt-9">
   <h2 className="text-3xl font-black tracking-tight">Your perspective matters.</h2>
   <p className="mt-3 text-lg leading-7">Would you use this? What would make you hesitate? What would make it feel safer? What would you change?</p>
   <p className="mt-3 text-sm text-[#666666]">Skeptical takes and constructive criticism are welcome. There is no reward for posting feedback here.</p>
   <DiscussionComments/>
  </section>
  <section className="mt-14 border-t border-[#cccccc] pt-8">
   <h2 className="text-xl font-bold">Want to try it?</h2>
   <div className="mt-4 flex flex-wrap gap-6"><Link href="/" className="underline underline-offset-4">Browse meetups →</Link><Link href="/write" className="underline underline-offset-4">Post a meetup →</Link></div>
  </section>
 </main>;
}
