'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockDashboardData, mockOpeningPerformance } from '@/lib/mock-data';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, Percent, ChevronsRight, ShieldCheck } from 'lucide-react';

export default function ProgressPage() {
    const { ratingHistory, accuracyHistory } = mockDashboardData;
    const openings = mockOpeningPerformance;
    const COLORS = ['hsl(var(--accent))', 'hsl(var(--muted-foreground))', 'hsl(var(--destructive))'];

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Progress Tracking</h2>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Rating & Accuracy</TabsTrigger>
          <TabsTrigger value="openings">Openings</TabsTrigger>
          <TabsTrigger value="time">Time Pressure</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rating Trend</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                         <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={ratingHistory}>
                                <XAxis dataKey="name" fontSize={12} />
                                <YAxis fontSize={12} domain={['dataMin - 50', 'dataMax + 50']} />
                                <Tooltip />
                                <Line type="monotone" dataKey="rating" stroke="hsl(var(--primary))" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Accuracy Trend</CardTitle>
                        <Percent className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                         <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={accuracyHistory}>
                                <XAxis dataKey="name" fontSize={12} />
                                <YAxis fontSize={12} domain={[80, 100]} />
                                <Tooltip />
                                <Bar dataKey="accuracy" fill="hsl(var(--accent))" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
        
        <TabsContent value="openings">
            <Card>
                <CardHeader>
                    <CardTitle>Opening Performance</CardTitle>
                    <CardDescription>Win rates and performance per ECO code.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Opening</TableHead>
                                <TableHead className="text-center">Games</TableHead>
                                <TableHead>Win Rate</TableHead>
                                <TableHead className="text-right">Avg. Accuracy</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {openings.map(op => (
                                <TableRow key={op.eco}>
                                    <TableCell>
                                        <div className="font-medium">{op.name}</div>
                                        <div className="text-sm text-muted-foreground">{op.eco}</div>
                                    </TableCell>
                                    <TableCell className="text-center">{op.games}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span>{((op.win / op.games) * 100).toFixed(1)}%</span>
                                            <div className="flex h-2 w-24 rounded-full bg-muted">
                                                <div className="h-2 rounded-l-full bg-accent" style={{width: `${(op.win / op.games) * 100}%`}}></div>
                                                <div className="h-2 bg-muted-foreground" style={{width: `${(op.draw / op.games) * 100}%`}}></div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">{op.avgAccuracy.toFixed(1)}%</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="time">
             <Card className="h-96">
                <CardHeader>
                    <CardTitle>Time Pressure Performance</CardTitle>
                </CardHeader>
                <CardContent className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">Time pressure insights coming soon.</p>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
