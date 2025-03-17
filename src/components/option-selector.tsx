"use client";

import { Button } from "@/components/ui/button";

interface OptionSelectorProps {
  options: string[];
  onSelect: (option: string) => void;
  disabled?: boolean;
}

export function OptionSelector({
  options,
  onSelect,
  disabled = false,
}: OptionSelectorProps) {
  return (
    <div className="space-y-2">
      {options.map((option, index) => (
        <Button
          key={index}
          variant="outline"
          className="w-full justify-start text-left h-auto py-3 bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
          onClick={() => onSelect(option)}
          disabled={disabled}
        >
          {option}
        </Button>
      ))}
    </div>
  );
}
