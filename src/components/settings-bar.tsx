"use client";

import { Volume2, VolumeX } from "lucide-react";
import { Button } from "./ui/button";
import { useAtom, useSetAtom } from "jotai";
import { isAudioEnabledAtom, messageHistoryAtom } from "./game-interface";

export function SettingsBar() {
  const [audioEnabled, setAudioEnabled] = useAtom(isAudioEnabledAtom);
  const setMessageHistroy = useSetAtom(messageHistoryAtom);

  return (
    <>
      {/* <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
        onClick={() => setAudioEnabled((prev: boolean) => !prev)}
      >
        {audioEnabled ? (
          <Volume2 className="h-5 w-5" />
        ) : (
          <VolumeX className="h-5 w-5" />
        )}
      </Button> */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-16 right-4 bg-black/50 hover:bg-black/70 text-white"
        onClick={() => setMessageHistroy([])}
      >
        Clear Messages
      </Button>
    </>
  );
}
