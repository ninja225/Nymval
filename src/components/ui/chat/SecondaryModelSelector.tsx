
import { useState } from 'react';
import { CheckIcon, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ModelType } from '@/types/models';
import { cn } from '@/lib/utils';

interface SecondaryModelSelectorProps {
  models: ModelType[];
  selectedModel?: string;
  onSelectModel: (modelId: string) => void;
  excludeModelId?: string;
}

export function SecondaryModelSelector({ 
  models, 
  selectedModel, 
  onSelectModel,
  excludeModelId
}: SecondaryModelSelectorProps) {
  const [open, setOpen] = useState(false);
  
  const filteredModels = models.filter(model => model.id !== excludeModelId);
  const selectedModelData = models.find(model => model.id === selectedModel);
  
  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="justify-between w-[220px] text-left font-normal"
          >
            {selectedModelData ? (
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="truncate">{selectedModelData.name}</span>
                <span className="text-xs text-muted-foreground">
                  {selectedModelData.provider}
                </span>
              </div>
            ) : (
              "Select second model..."
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-0" align="end">
          <Command>
            <CommandInput placeholder="Search models..." />
            <CommandList>
              <CommandEmpty>No models found.</CommandEmpty>
              <CommandGroup heading="Available Models">
                {filteredModels.map(model => (
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
                          selectedModel === model.id ? "opacity-100" : "opacity-0"
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
    </div>
  );
}
