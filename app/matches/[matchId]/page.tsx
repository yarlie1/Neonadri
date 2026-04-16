import { redirect, notFound } from "next/navigation";

type PageProps = {
  params: {
    matchId: string;
  };
};

export default async function MatchChatPage({ params }: PageProps) {
  const matchId = Number(params.matchId);
  if (!Number.isFinite(matchId)) {
    notFound();
  }
  redirect(`/matches/${matchId}/chat`);
}
