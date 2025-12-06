import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import type { Settings } from "@shared/schema";

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

const voiceOptions: { value: Settings["voiceGender"]; label: string; description: string }[] = [
  { value: "alloy", label: "Alloy", description: "Neutral and balanced" },
  { value: "echo", label: "Echo", description: "Warm and conversational" },
  { value: "fable", label: "Fable", description: "Expressive and dynamic" },
  { value: "onyx", label: "Onyx", description: "Deep and authoritative" },
  { value: "nova", label: "Nova", description: "Friendly and upbeat" },
  { value: "shimmer", label: "Shimmer", description: "Clear and refined" },
];

export function SettingsPanel({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
}: SettingsPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md glass-panel border-l border-border/50 overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="font-display text-xl tracking-wide text-foreground">
            Settings
          </SheetTitle>
          <SheetDescription className="text-muted-foreground font-body">
            Customize your Helfer experience
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8">
          <section>
            <h3 className="font-display text-sm font-medium tracking-wider uppercase text-muted-foreground mb-4">
              Voice Selection
            </h3>
            <RadioGroup
              value={settings.voiceGender}
              onValueChange={(value) =>
                onSettingsChange({
                  ...settings,
                  voiceGender: value as Settings["voiceGender"],
                })
              }
              className="space-y-3"
              data-testid="radio-voice-gender"
            >
              {voiceOptions.map((option) => (
                <div key={option.value} className="flex items-start gap-3">
                  <RadioGroupItem
                    value={option.value}
                    id={`voice-${option.value}`}
                    className="mt-1 border-neon-cyan/50 data-[state=checked]:border-neon-cyan data-[state=checked]:text-neon-cyan"
                    data-testid={`radio-voice-${option.value}`}
                  />
                  <Label
                    htmlFor={`voice-${option.value}`}
                    className="flex-1 cursor-pointer"
                  >
                    <span className="font-body font-medium text-foreground block">
                      {option.label}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {option.description}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </section>

          <Separator className="bg-border/50" />

          <section>
            <h3 className="font-display text-sm font-medium tracking-wider uppercase text-muted-foreground mb-4">
              Voice Speed
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="font-body text-foreground">
                  Playback Speed
                </Label>
                <span 
                  className="font-mono text-sm text-neon-cyan"
                  data-testid="text-voice-speed"
                >
                  {settings.voiceSpeed.toFixed(2)}x
                </span>
              </div>
              <Slider
                value={[settings.voiceSpeed]}
                onValueChange={([value]) =>
                  onSettingsChange({ ...settings, voiceSpeed: value })
                }
                min={0.25}
                max={4.0}
                step={0.25}
                className="[&_[role=slider]]:bg-neon-cyan [&_[role=slider]]:border-neon-cyan/50"
                data-testid="slider-voice-speed"
              />
              <div className="flex justify-between text-xs text-muted-foreground font-mono">
                <span>0.25x</span>
                <span>1x</span>
                <span>2x</span>
                <span>4x</span>
              </div>
            </div>
          </section>

          <Separator className="bg-border/50" />

          <section>
            <h3 className="font-display text-sm font-medium tracking-wider uppercase text-muted-foreground mb-4">
              Listening Mode
            </h3>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <Label 
                  htmlFor="continuous-listening" 
                  className="font-body text-foreground block mb-1"
                >
                  Continuous Listening
                </Label>
                <p className="text-sm text-muted-foreground">
                  Keep the microphone active after each response
                </p>
              </div>
              <Switch
                id="continuous-listening"
                checked={settings.continuousListening}
                onCheckedChange={(checked) =>
                  onSettingsChange({ ...settings, continuousListening: checked })
                }
                className="data-[state=checked]:bg-neon-cyan"
                data-testid="switch-continuous-listening"
              />
            </div>
          </section>

          <Separator className="bg-border/50" />

          <section>
            <h3 className="font-display text-sm font-medium tracking-wider uppercase text-muted-foreground mb-4">
              Wake Phrase
            </h3>
            <div className="p-4 rounded-lg bg-card/50 border border-border/50">
              <p className="font-body text-foreground mb-2">
                Say the following phrase to activate Helfer:
              </p>
              <p className="font-display text-lg text-neon-cyan neon-text-cyan tracking-wide">
                "Helfer, wake up"
              </p>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
