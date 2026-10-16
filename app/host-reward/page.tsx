import Link from "next/link";
import HostRewardPanel from "./HostRewardPanel";
export const metadata={title:"$100 Host Reward",description:"Host a meetup in LA County, complete both reviews, and share your honest experience. First 10 eligible hosts get $100."};
export default function HostRewardPage(){
 return <main className="mx-auto max-w-3xl px-5 py-12 text-[#111111]">
  <p className="text-sm font-bold uppercase tracking-widest">Neonadri · Host Reward</p>
  <h1 className="mt-5 text-4xl font-black sm:text-6xl">Host a meetup.<br/>Share your experience.<br/>Get $100.</h1>
  <p className="mt-6 text-lg leading-8">For the first 10 eligible hosts who complete all requirements and submit a claim. U.S. residents age 18+. Meetups must take place in Los Angeles County.</p>
  <p className="mt-4 leading-7">October 20, 2026 at 12:00 a.m. through November 30, 2026 at 11:59 p.m. Pacific Time, or earlier when all 10 rewards are approved.</p>
  <div className="my-7 flex flex-wrap gap-4"><Link href="/write" className="border border-black bg-black px-5 py-3 font-bold text-white" style={{color:"white"}}>Post a Meetup</Link><a href="#host-reward-claim" className="border px-5 py-3 font-bold">Check My Eligibility</a></div>
  <ol className="space-y-6 border-y py-7">{[
   ["1. Host a meetup","Create a meetup on Neonadri, accept a guest through the site, and meet in person in a public place in LA County during the event period."],
   ["2. Complete both reviews","You and your guest must each submit a review and truthfully answer Yes to whether the other person attended. Ratings and opinions do not affect eligibility."],
   ["3. Share and apply","Post your honest experience on Discussion using the reward form. Posting and submitting your claim happen together. No separate email is required."],
   ["4. Receive $100","We review claims within 7 business days and send approved rewards within 7 business days of approval through Tango. Check your claim status in your Dashboard."]
  ].map(([title,body])=><li key={title}><h2 className="text-xl font-bold">{title}</h2><p className="mt-2 leading-7">{body}</p></li>)}</ol>
  <HostRewardPanel/>
  <h2 className="mt-9 text-2xl font-bold">Good to know</h2>
  <div className="mt-4 space-y-4 leading-7">
   <p>One $100 reward per person, for hosts only. Guests are not eligible. Claims are reviewed in submission order; a pending claim is not a guaranteed reward.</p>
   <p>Already earned the $10 Launch Reward? You can earn this $100 reward too. Meet each promotion’s separate requirements to receive up to $110. <Link href="/reward" className="underline">See the $10 event.</Link></p>
   <p>Honest criticism is welcome. Positive ratings or positive feedback are never required. Event experiences display a reward-program disclosure.</p>
   <p>Deleting your experience before approval withdraws your pending claim. There is no required retention period after approval. Photos and your guest’s name are not required.</p>
   <p>There is no purchase or participation fee. Any activity costs agreed with your guest remain separate. Never continue an uncomfortable meetup to earn a reward.</p>
   <p>Business days are Monday–Friday, excluding U.S. federal holidays. <Link href="/host-reward/rules" className="underline">Read the Official Rules.</Link></p>
  </div>
 </main>;
}

