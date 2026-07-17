import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FilePlus, Upload } from 'lucide-react';
import { mockGames } from '@/lib/mock-data';
import type { Game } from '@/lib/types';

function getPlayerResult(game: Game, playerName: string) {
  if (game.whitePlayer.name === playerName) {
    if (game.result === '1-0') return 'Win';
    if (game.result === '0-1') return 'Loss';
  } else {
    if (game.result === '0-1') return 'Win';
    if (game.result === '1-0') return 'Loss';
  }
  return 'Draw';
}

export default function GamesPage() {
  const games = mockGames;

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Game Library</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Import PGN</Button>
          <Button><FilePlus className="mr-2 h-4 w-4" /> Import from Lichess</Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Players</TableHead>
              <TableHead>Opening</TableHead>
              <TableHead className="text-center">Result</TableHead>
              <TableHead className="text-right">Accuracy</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {games.map((game) => {
              const userIsWhite = game.whitePlayer.name === 'You';
              const opponent = userIsWhite ? game.blackPlayer : game.whitePlayer;
              const userAccuracy = userIsWhite ? game.accuracy.white : game.accuracy.black;
              const result = getPlayerResult(game, 'You');

              return (
                <TableRow key={game.id}>
                  <TableCell className="font-medium">{game.date}</TableCell>
                  <TableCell>
                    <div>
                      You ({userIsWhite ? game.whitePlayer.rating : game.blackPlayer.rating}) vs. {opponent.name} ({opponent.rating})
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                        <span>{game.opening.name}</span>
                        <span className="text-sm text-muted-foreground">{game.opening.eco}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={result === 'Win' ? 'default' : result === 'Loss' ? 'destructive' : 'secondary'}
                        className={result === 'Win' ? 'bg-accent text-accent-foreground' : ''}>
                        {result}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{userAccuracy}%</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/games/${game.id}`}>Analyze</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
