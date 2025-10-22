import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';
import { Sun, Moon, Laptop, Square, Circle } from 'lucide-react';
import { useTheme } from 'next-themes';
import useStore from '@/lib/store';
import { MODELS } from '@/lib/chat';
import type { AnimationSpeed } from '@/lib/settings';
const IMAGE_MODELS = [
    { id: 'pollinations/stable-diffusion-xl', name: 'Stable Diffusion XL' },
    { id: 'pollinations/dall-e-3', name: 'DALL-E 3' },
    { id: 'pollinations/midjourney-v6', name: 'Midjourney v6' },
];
export function SettingsDialog({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const settings = useStore(s => s.settings);
  const setSettings = useStore(s => s.setSettings);
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize the appearance and behavior of Deep Down AI.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="models">AI Models</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="pt-4 space-y-6">
            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="flex gap-2">
                <Button variant={theme === 'light' ? 'default' : 'outline'} size="icon" onClick={() => setTheme('light')}><Sun className="h-5 w-5" /></Button>
                <Button variant={theme === 'dark' ? 'default' : 'outline'} size="icon" onClick={() => setTheme('dark')}><Moon className="h-5 w-5" /></Button>
                <Button variant={theme === 'system' ? 'default' : 'outline'} size="icon" onClick={() => setTheme('system')}><Laptop className="h-5 w-5" /></Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fontSize">Font Size ({settings.fontSize}px)</Label>
              <Slider
                id="fontSize"
                min={12}
                max={18}
                step={1}
                value={[settings.fontSize]}
                onValueChange={(value) => setSettings({ fontSize: value[0] })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="showTimestamps">Show Timestamps</Label>
              <Switch
                id="showTimestamps"
                checked={settings.showTimestamps}
                onCheckedChange={(checked) => setSettings({ showTimestamps: checked })}
              />
            </div>
          </TabsContent>
          <TabsContent value="appearance" className="pt-4 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="chatWidth">Chat Width ({settings.chatWidth}%)</Label>
              <Slider
                id="chatWidth"
                min={50}
                max={100}
                step={5}
                value={[settings.chatWidth]}
                onValueChange={(value) => setSettings({ chatWidth: value[0] })}
              />
            </div>
            <div className="space-y-2">
              <Label>Chat Bubble Shape</Label>
              <ToggleGroup
                type="single"
                value={settings.bubbleShape}
                onValueChange={(value) => value && setSettings({ bubbleShape: value as 'rounded' | 'square' })}
              >
                <ToggleGroupItem value="rounded" aria-label="Rounded bubbles"><Circle className="h-5 w-5" /></ToggleGroupItem>
                <ToggleGroupItem value="square" aria-label="Square bubbles"><Square className="h-5 w-5" /></ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="animationSpeed">Animation Speed</Label>
              <Select
                value={settings.animationSpeed}
                onValueChange={(value: AnimationSpeed) => setSettings({ animationSpeed: value })}
              >
                <SelectTrigger id="animationSpeed">
                  <SelectValue placeholder="Select speed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">Fast</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="slow">Slow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="reduceMotion">Reduce Motion</Label>
              <Switch
                id="reduceMotion"
                checked={settings.reduceMotion}
                onCheckedChange={(checked) => setSettings({ reduceMotion: checked })}
              />
            </div>
          </TabsContent>
          <TabsContent value="models" className="pt-4 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="textModel">Default Text Model</Label>
              <Select
                value={settings.defaultTextModel}
                onValueChange={(value) => setSettings({ defaultTextModel: value })}
              >
                <SelectTrigger id="textModel">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map(model => (
                    <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageModel">Default Image Model</Label>
              <Select
                value={settings.defaultImageModel}
                onValueChange={(value) => setSettings({ defaultImageModel: value })}
              >
                <SelectTrigger id="imageModel">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {IMAGE_MODELS.map(model => (
                    <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground p-3 bg-secondary rounded-md">
              <p className="font-semibold">AI Usage Notice</p>
              <p>Please be aware of shared usage limits on AI servers.</p>
            </div>
          </TabsContent>
          <TabsContent value="advanced" className="pt-4 space-y-6">
             <div className="space-y-2">
                <Label htmlFor="customTextEndpoint">Custom Text Endpoint</Label>
                <Input
                  id="customTextEndpoint"
                  placeholder="https://..."
                  value={settings.customTextEndpoint}
                  onChange={(e) => setSettings({ customTextEndpoint: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customImageEndpoint">Custom Image Endpoint</Label>
                <Input
                  id="customImageEndpoint"
                  placeholder="https://..."
                  value={settings.customImageEndpoint}
                  onChange={(e) => setSettings({ customImageEndpoint: e.target.value })}
                />
              </div>
              <p className="text-sm text-muted-foreground">Advanced settings for power users.</p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}