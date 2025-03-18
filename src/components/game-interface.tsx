"use client";

import { useState, useRef } from "react";
import { OptionSelector } from "./option-selector";
import { TextInput } from "./text-input";
import clsx from "clsx";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "./ui/button";

export interface HistoryItem {
  type: "player" | "system";
  text: string;
}

export function GameInterface() {
  const [currentScene, setCurrentScene] = useState<number>(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [playerName, setPlayerName] = useState<string>("");
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [options, setOptions] = useState<string[]>([]);
  const [waitingForInput, setWaitingForInput] = useState<boolean>(false);
  const [currentImage, setCurrentImage] = useState<string>(
    "/placeholder.svg?height=512&width=512"
  );
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [isGeneratingText, setIsGeneratingText] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [currentMessage, setCurrentMessage] = useState<string>(
    "Welcome to your dynamic visual novel adventure. What's your name?"
  );

  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const toggleAudio = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
    }
    setAudioEnabled((prev) => !prev);
    setIsSpeaking(false);
  };

  const handleTextInput = (input: string) => {
    // Handle text input logic here
  };

  const handleOptionSelect = (option: string) => {
    // Handle option selection logic here
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <ImageDisplay
        currentImage={currentImage}
        isGeneratingImage={isGeneratingImage}
        audioEnabled={audioEnabled}
        toggleAudio={toggleAudio}
      />
      <div className="flex-1 flex flex-col p-4 bg-gray-900 overflow-hidden">
        <MessageHistory history={history} messagesEndRef={messagesEndRef} />
        <CurrentMessage
          isGeneratingText={isGeneratingText}
          isSpeaking={isSpeaking}
          currentMessage={currentMessage}
        />
        <InputArea
          showOptions={showOptions}
          options={options}
          onOptionSelect={handleOptionSelect}
          onTextSubmit={handleTextInput}
          isGeneratingText={isGeneratingText}
          waitingForInput={waitingForInput}
        />
      </div>
    </div>
  );
}

interface InputAreaProps {
  showOptions: boolean;
  options: string[];
  onOptionSelect: (option: string) => void;
  onTextSubmit: (input: string) => void;
  isGeneratingText: boolean;
  waitingForInput: boolean;
}

export function InputArea({
  showOptions,
  options,
  onOptionSelect,
  onTextSubmit,
  isGeneratingText,
  waitingForInput,
}: InputAreaProps) {
  return showOptions ? (
    <OptionSelector
      options={options}
      onSelect={onOptionSelect}
      disabled={isGeneratingText}
    />
  ) : (
    <TextInput
      onSubmit={onTextSubmit}
      disabled={!waitingForInput || isGeneratingText}
      placeholder={
        waitingForInput ? "What will you do?" : "Waiting for the story..."
      }
    />
  );
}
interface CurrentMessageProps {
  isGeneratingText: boolean;
  isSpeaking: boolean;
  currentMessage: string;
}

export function CurrentMessage({
  isGeneratingText,
  isSpeaking,
  currentMessage,
}: CurrentMessageProps) {
  return (
    <div className="mb-4 p-4 bg-gray-800 rounded-lg">
      {isGeneratingText ? (
        <div className="flex items-center space-x-2">
          <div
            className="w-3 h-3 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-3 h-3 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-3 h-3 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      ) : (
        <p className={clsx(isSpeaking && "border-l-4 border-primary pl-2")}>
          {currentMessage}
        </p>
      )}
    </div>
  );
}

interface MessageHistoryProps {
  history: HistoryItem[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function MessageHistory({
  history,
  messagesEndRef,
}: MessageHistoryProps) {
  return (
    <div className="flex-1 overflow-y-auto mb-4 space-y-4">
      {history.map((item, index) => (
        <div
          key={index}
          className={clsx(
            "p-3 rounded-lg max-w-[80%]",
            item.type === "player"
              ? "bg-primary text-primary-foreground ml-auto"
              : "bg-muted text-muted-foreground"
          )}
        >
          {item.text}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

interface ImageDisplayProps {
  currentImage: string;
  isGeneratingImage: boolean;
  audioEnabled: boolean;
  toggleAudio: () => void;
}

export function ImageDisplay({
  currentImage,
  isGeneratingImage,
  audioEnabled,
  toggleAudio,
}: ImageDisplayProps) {
  return (
    <div className="relative w-full h-1/2 bg-gray-900">
      {isGeneratingImage ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <img
          src={currentImage || "/placeholder.svg"}
          alt="Scene"
          className="w-full h-full object-cover"
        />
      )}

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
        onClick={toggleAudio}
      >
        {audioEnabled ? (
          <Volume2 className="h-5 w-5" />
        ) : (
          <VolumeX className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
