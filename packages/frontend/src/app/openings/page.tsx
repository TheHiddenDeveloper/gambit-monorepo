'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockOpeningPerformance } from '@/lib/mock-data';
import type { OpeningPerformance } from '@/lib/types';
import { ArrowUpDown, Search } from 'lucide-react';
import Link from 'next/link';

type SortKey = keyof OpeningPerformance | 'winRate';

export default function OpeningsPage() {
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: 'ascending' | 'descending';
  } | null>({ key: 'games', direction: 'descending' });

  const filteredAndSortedOpenings = useMemo(() => {
    let openings = mockOpeningPerformance.filter(
      (op) =>
        op.name.toLowerCase().includes(search.toLowerCase()) ||
        op.eco.toLowerCase().includes(search.toLowerCase())
    );

    if (sortConfig !== null) {
      openings.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        if (sortConfig.key === 'winRate') {
            aValue = a.win / a.games;
            bValue = b.win / b.games;
        } else {
            aValue = a[sortConfig.key as keyof OpeningPerformance];
            bValue = b[sortConfig.key as keyof OpeningPerformance];
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return openings;
  }, [search, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />;
    }
    return sortConfig.direction === 'descending' ? ' ▼' : ' ▲';
  };

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Opening Explorer</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Openings</CardTitle>
          <CardDescription>
            Explore opening theory based on your games and performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter openings by name or ECO..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => requestSort('name')}>
                      Opening {getSortIndicator('name')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button variant="ghost" onClick={() => requestSort('games')}>
                      Games {getSortIndicator('games')}
                    </Button>
                  </TableHead>
                  <TableHead>
                     <Button variant="ghost" onClick={() => requestSort('winRate')}>
                        Win Rate {getSortIndicator('winRate')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" onClick={() => requestSort('avgAccuracy')}>
                      Avg. Accuracy {getSortIndicator('avgAccuracy')}
                    </Button>
                  </TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedOpenings.map((op) => (
                  <TableRow key={op.eco}>
                    <TableCell>
                      <div className="font-medium">{op.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {op.eco}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{op.games}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{((op.win / op.games) * 100).toFixed(1)}%</span>
                        <div className="h-2 w-24 rounded-full bg-muted" title={`W: ${op.win} / D: ${op.draw} / L: ${op.loss}`}>
                          <div
                            className="h-2 rounded-l-full bg-accent"
                            style={{
                              width: `${(op.win / op.games) * 100}%`,
                            }}
                          ></div>
                          <div
                            className="h-2 bg-muted-foreground"
                            style={{
                              width: `${(op.draw / op.games) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {op.avgAccuracy.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/analysis-board">Explore</Link>
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
