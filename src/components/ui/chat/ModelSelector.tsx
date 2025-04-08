
import { useState } from 'react';
import { CheckIcon, ChevronDown, GanttChartSquare, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ModelType } from '@/types/models';
import { cn } from '@/lib/utils';

interface ModelSelectorProps {
  models: ModelType[];
  selectedModels: string[];
  onSelectModel: (modelId: string) => void;
  splitView: boolean;
  onToggleSplitView: () => void;
}

export function ModelSelector({ 
  models, 
  selectedModels, 
  onSelectModel, 
  splitView, 
  onToggleSplitView 
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  
  const selectedModel = models.find(model => model.id === selectedModels[0]);
  
  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="justify-between w-[220px] text-left font-normal"
          >
            {selectedModel ? (
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="truncate">{selectedModel.name}</span>
                <span className="text-xs text-muted-foreground">
                  {selectedModel.provider}
                </span>
              </div>
            ) : (
              "Select model..."
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search models..." />
            <CommandList>
              <CommandEmpty>No models found.</CommandEmpty>
              <CommandGroup heading="Available Models">
                {models.map(model => (
                  <CommandItem
                    key={model.id}
                    value={model.id}
                    onSelect={() => {
                      onSelectModel(model.id);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span>{model.name}</span>
                        <p className="text-xs text-muted-foreground">{model.provider}</p>
                      </div>
                      <CheckIcon
                        className={cn(
                          "h-4 w-4",
                          selectedModels.includes(model.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2">
          <Switch id="split-view" checked={splitView} onCheckedChange={onToggleSplitView} />
          <Label htmlFor="split-view" className="cursor-pointer">
            {splitView ? "Turn Off Dual Model Mode" : "Turn On Dual Model Mode"}
          </Label>
        </div>
      </div>
    </div>
  );
}
