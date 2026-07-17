'use server';

import { analyzeMultipleGames } from '@/ai/flows/analyze-multiple-games-for-weaknesses';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { mockGames } from '@/lib/mock-data';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, ListChecks, CheckCircle2 } from 'lucide-react';
import type { AnalyzeMultipleGamesOutput } from '@/ai/flows/analyze-multiple-games-for-weaknesses';

async function getAnalysisResult(): Promise<AnalyzeMultipleGamesOutput | null | { error: string }> {
  'use server';
  const cookieStore = await cookies();
  const result = cookieStore.get('analysisResult');
  if (!result) return null;
  try {
    return JSON.parse(result.value);
  } catch {
    return null;
  }
}

async function runAnalysis(formData: FormData) {
  'use server';
  const selectedGameIds = formData.getAll('gameIds') as string[];
  const selectedGames = mockGames.filter((game) =>
    selectedGameIds.includes(game.id)
  );
  
  if (selectedGames.length === 0) {
    const cookieStore = await cookies();
    cookieStore.set('analysisResult', JSON.stringify({ error: "Please select at least one game to analyze." }), { httpOnly: true });
    revalidatePath('/analysis');
    return;
  }

  try {
    const pgns = selectedGames.map((game) => game.pgn);
    const result = await analyzeMultipleGames({ pgns });
    const cookieStore = await cookies();
    cookieStore.set('analysisResult', JSON.stringify(result), { httpOnly: true });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    const cookieStore = await cookies();
    cookieStore.set('analysisResult', JSON.stringify({ error: errorMessage }), { httpOnly: true });
  }

  revalidatePath('/analysis');
}

export default async function AnalysisPage() {
  const analysisResult = await getAnalysisResult();
  
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          AI Weakness Detection
        </h2>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Select Games for Analysis</CardTitle>
            <CardDescription>
              Choose the games you want the AI to analyze for recurring
              strategic weaknesses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={runAnalysis}>
              <div className="space-y-4">
                {mockGames.map((game) => (
                  <div
                    key={game.id}
                    className="flex items-center space-x-2 rounded-md border p-4"
                  >
                    <Checkbox id={game.id} name="gameIds" value={game.id} />
                    <div className="grid gap-1.5 leading-none">
                      <label htmlFor={game.id} className="font-medium">
                        vs. {game.blackPlayer.name === 'You' ? game.whitePlayer.name : game.blackPlayer.name} ({game.result})
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {game.date} - {game.opening.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button type="submit" className="mt-6 w-full">
                Analyze Weaknesses
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              The AI has identified the following patterns in your games.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysisResult === null ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Lightbulb className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  Your analysis results will appear here.
                </p>
              </div>
            ) : 'error' in analysisResult ? (
              <Alert variant="destructive">
                <AlertTitle>Analysis Failed</AlertTitle>
                <AlertDescription>{analysisResult.error}</AlertDescription>
              </Alert>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="weaknesses">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <ListChecks className="h-5 w-5" />
                      Identified Weaknesses
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc space-y-2 pl-6">
                      {analysisResult.weaknesses.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="improvements">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Suggested Improvements
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc space-y-2 pl-6">
                      {analysisResult.suggestedImprovements.map(
                        (item, index) => (
                          <li key={index}>{item}</li>
                        )
                      )}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
