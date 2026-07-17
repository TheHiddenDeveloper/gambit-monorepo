'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTheme } from '@/components/theme-provider';
import { Switch } from '@/components/ui/switch';
import { useSettingsUpdate } from '@/hooks/use-settings';

export default function SettingsPage() {
  const { stockfishDepth, setStockfishDepth } = useSettingsUpdate();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Analysis</CardTitle>
            <CardDescription>
              Adjust the parameters for game analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col space-y-3">
              <Label htmlFor="stockfish-depth">Stockfish Depth</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="stockfish-depth"
                  min={10}
                  max={30}
                  step={1}
                  value={[stockfishDepth]}
                  onValueChange={(value) => setStockfishDepth(value[0])}
                  className="w-64"
                />
                <span className="font-mono text-lg">{stockfishDepth}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Higher depth means stronger analysis but takes more time.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the look and feel of the application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">Select a light, dark, or system theme.</p>
              </div>
              <Select
                value={theme}
                onValueChange={(value: 'light' | 'dark' | 'system') =>
                  setTheme(value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Text Size</Label>
                <p className="text-sm text-muted-foreground">Adjust the application text size (coming soon).</p>
              </div>
              <Button variant="outline" disabled>Adjust Size</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Manage your account and integrations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="flex items-center justify-between">
              <div>
                <Label>Lichess Integration</Label>
                <p className="text-sm text-muted-foreground">Connect your Lichess account to import games.</p>
              </div>
              <Button>Connect</Button>
            </div>
             <div className="flex items-center justify-between">
                <div>
                    <Label>Sign Out</Label>
                    <p className="text-sm text-muted-foreground">Sign out of your account.</p>
                </div>
                <Button variant="destructive">Sign Out</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
