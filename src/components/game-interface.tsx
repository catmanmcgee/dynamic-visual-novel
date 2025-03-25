"use client";

import { useRef, useEffect, ReactNode } from "react";
import { TextInput } from "./text-input";
import clsx from "clsx";
import { Button } from "./ui/button";
import { useTxt2Img } from "./useStableDifusion";
import { useScreen } from "usehooks-ts";
import { useChat } from "./useChat";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useVoiceTranscription } from "./useVoiceTranscription";
import { SettingsBar } from "./settings-bar";

export interface HistoryItem {
  role: "player" | "system";
  text: string;
}

export const messageHistoryAtom = atomWithStorage<
  { role: string; content: string }[]
>("messageHistory", [], undefined, { getOnInit: true });
export const isGeneratingTextAtom = atom<boolean>(false);
export const isAudioEnabledAtom = atom<boolean>(false);

export function GameInterface() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hiden bg-black text-white">
      <ImageDisplay currentImage={<YandereGfMain />} />
      <div className="flex-1 flex flex-col p-4 overflow-hidden z-10 min-h-[500px]">
        <MessageHistory />
        <ChatBox />
      </div>
    </div>
  );
}

function YandereGfMain() {
  const screen = useScreen();

  const imgResult = useTxt2Img({
    subject: "yandere, maid, girlfriend",
    environment: "dark room, torture tools, mood lighting",
    screen,
  });

  useEffect(() => {
    if (imgResult.images.length === 0) {
      imgResult.generateImages();
    }
  }, []);

  if (imgResult.loading || !imgResult.images) {
    return <div>It takes up to 45s to load an image...</div>;
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center overflow-hidden absolute">
      <Button className="absolute top-2 left-2" onClick={imgResult.refresh}>
        Refresh
      </Button>
      <img
        src={`data:image/png;base64,${imgResult.images[0]}`}
        alt=""
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export function ChatBox() {
  const [isGeneratingText, setIsGeneratingText] = useAtom(isGeneratingTextAtom);
  const setMessages = useSetAtom(messageHistoryAtom);
  const { isLoading, error, sendMessage } = useChat();
  useEffect(() => {
    error && console.error(error);
  }, [error]);

  return (
    <TextInput
      onSubmit={(text) => {
        setMessages((prev) => [...prev, { role: "player", content: text }]);
        setIsGeneratingText(true);
        sendMessage(text)
          .then((response) => {
            setMessages((prev) => [...prev, response]);
          })
          .finally(() => {
            setIsGeneratingText(false);
          });
      }}
      disabled={isLoading || isGeneratingText}
      placeholder={isLoading ? "What will you do?" : "Waiting for the story..."}
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

function MessageItem({ content, role }: { content: string; role: string }) {
  const { isLoading, voiceTranscribe } = useVoiceTranscription();

  return (
    <div className="flex flex-row">
      {role !== "player" && (
        <Button
          onClick={() => {
            const matches = content.matchAll(/"([^"]+)"/gm);
            const text = [...matches].map((match) => match[1]).join("\n");

            if (text) {
              const sanitizedContent = text.replaceAll(/[~]+/g, "");
              voiceTranscribe(sanitizedContent);
            }
          }}
          className={clsx(
            "w-8 h-8 flex items-center justify-center bg-primary mt-2"
          )}
        >
          ▶
        </Button>
      )}
      <div
        className={clsx(
          "p-3 rounded-lg text-wrap text-left w-full whitespace-pre-wrap",
          isLoading && "animate-pulse bg-blue-900/80 rounded",
          role === "player"
            ? "bg-primary text-primary-foreground ml-auto"
            : "bg-muted text-muted-foreground"
        )}
      >
        {content}
      </div>
    </div>
  );
}

function MessageHistory() {
  const history = useAtomValue(messageHistoryAtom);
  const isGeneratingText = useAtomValue(isGeneratingTextAtom);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageContainerRef.current?.scrollTo(0, 10000);
  }, [history]);

  return (
    <div
      className="flex-1 overflow-y-auto overflow-x-hidden mb-4 space-y-4 bg-blue-900/50 z-10"
      ref={messageContainerRef}
    >
      {history.map((item, index) => (
        <MessageItem key={index} content={item.content} role={item.role} />
      ))}
      <div
        className={clsx(
          isGeneratingText &&
            "animate-pulse bg-gradient-to-r from-blue-800/80 via-blue-900/80 to-blue-800/80"
        )}
      >
        {isGeneratingText && "Thinking..."}
      </div>
    </div>
  );
}

export function ImageDisplay({ currentImage }: { currentImage: ReactNode }) {
  return (
    <div className="relative w-full h-1/2 bg-gray-900">
      {currentImage}
      <SettingsBar />
    </div>
  );
}
