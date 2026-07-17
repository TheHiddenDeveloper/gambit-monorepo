import { notFound } from 'next/navigation';
import { mockGames } from '@/lib/mock-data';
import { InteractiveAnalysis } from '@/components/interactive-analysis';

export default async function GameAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = mockGames.find((g) => g.id === id);

  if (!game) {
    notFound();
  }

  return <InteractiveAnalysis game={game} />;
}
