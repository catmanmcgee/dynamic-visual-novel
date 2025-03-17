"use client";

import { useState, useEffect, useRef } from "react";
import { TextInput } from "@/components/text-input";
import { OptionSelector } from "@/components/option-selector";
import { Button } from "@/components/ui/button";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { Volume2, VolumeX } from "lucide-react";
import clsx from "clsx";

export function GameInterface() {
  const [gameState, setGameState] = useState({
    currentScene: 0,
    history: [],
    playerName: "",
    showIntro: true,
    showOptions: false,
    options: [],
    waitingForInput: false,
    currentImage: "/placeholder.svg?height=512&width=512",
    isGeneratingImage: false,
    isGeneratingText: false,
    isSpeaking: false,
    audioEnabled: true,
    currentMessage:
      "Welcome to your dynamic visual novel adventure. What's your name?",
  });

  const speechSynthesisRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Text-to-speech function
  const speakText = (text) => {
    if (!gameState.audioEnabled) return;

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;

      setGameState((prev) => ({ ...prev, isSpeaking: true }));

      utterance.onend = () => {
        setGameState((prev) => ({ ...prev, isSpeaking: false }));
      };

      window.speechSynthesis.speak(utterance);
      speechSynthesisRef.current = utterance;
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (gameState.isSpeaking) {
      window.speechSynthesis.cancel();
    }

    setGameState((prev) => ({
      ...prev,
      audioEnabled: !prev.audioEnabled,
      isSpeaking: false,
    }));
  };

  // Generate story continuation with LLM
  const generateStory = async (input) => {
    setGameState((prev) => ({ ...prev, isGeneratingText: true }));

    try {
      const context = gameState.history
        .slice(-5)
        .map((item) => item.text)
        .join("\n");

      const prompt = `You are a dynamic visual novel game. Continue the story based on the player's input.
Current context:
${context}

Player input: ${input}

Generate a short, vivid continuation of the story (2-3 paragraphs) and determine if the player should be presented with choices.
If choices are needed, include exactly 3 options at the end in this format:
CHOICES:
1. First option
2. Second option
3. Third option

Also include a brief description for an image that represents this scene in this format:
IMAGE: [brief description for image generation]`;

      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        maxTokens: 500,
      });

      // Parse the response
      let newText = text;
      let newOptions = [];
      let imagePrompt = "";

      // Extract choices if present
      if (text.includes("CHOICES:")) {
        const [storyPart, choicesPart] = text.split("CHOICES:");
        newText = storyPart.trim();

        const choicesLines = choicesPart
          .split("\n")
          .filter((line) => line.trim());
        newOptions = choicesLines
          .filter((line) => /^\d+\./.test(line))
          .map((line) => line.replace(/^\d+\.\s*/, "").trim());
      }

      // Extract image prompt if present
      if (text.includes("IMAGE:")) {
        const imageParts = text.split("IMAGE:");
        imagePrompt = imageParts[1].trim();
        newText = imageParts[0].split("CHOICES:")[0].trim();
      }

      // Add to history
      const newHistoryItem = {
        type: "system",
        text: newText,
      };

      setGameState((prev) => ({
        ...prev,
        history: [...prev.history, newHistoryItem],
        currentMessage: newText,
        isGeneratingText: false,
        showOptions: newOptions.length > 0,
        options: newOptions,
        waitingForInput: newOptions.length === 0,
      }));

      // Speak the new text
      speakText(newText);

      // Generate image if we have a prompt
      if (imagePrompt) {
        generateImage(imagePrompt);
      }
    } catch (error) {
      console.error("Error generating story:", error);
      setGameState((prev) => ({
        ...prev,
        isGeneratingText: false,
        waitingForInput: true,
        currentMessage:
          "There was an error generating the story. Please try again.",
      }));
    }
  };

  // Generate image with Stable Diffusion
  const generateImage = async (prompt) => {
    setGameState((prev) => ({ ...prev, isGeneratingImage: true }));

    try {
      // This is a placeholder for the actual Replicate API call
      // In a real implementation, you would call the Replicate API here
      console.log("Generating image with prompt:", prompt);

      // Simulate image generation delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // For demo purposes, we'll just use a placeholder
      setGameState((prev) => ({
        ...prev,
        currentImage: `/placeholder.svg?height=512&width=512&text=${encodeURIComponent(prompt)}`,
        isGeneratingImage: false,
      }));
    } catch (error) {
      console.error("Error generating image:", error);
      setGameState((prev) => ({ ...prev, isGeneratingImage: false }));
    }
  };

  // Handle player text input
  const handleTextInput = (input) => {
    // Add player input to history
    const newHistoryItem = {
      type: "player",
      text: input,
    };

    setGameState((prev) => ({
      ...prev,
      history: [...prev.history, newHistoryItem],
      waitingForInput: false,
    }));

    // If this is the name input during intro
    if (gameState.showIntro) {
      setGameState((prev) => ({
        ...prev,
        playerName: input,
        showIntro: false,
        currentMessage: `Welcome, ${input}! Your adventure begins now. You find yourself standing at the edge of a mysterious forest. The trees sway gently in the breeze, and you can hear strange sounds coming from deep within.`,
        waitingForInput: true,
      }));

      // Generate first image
      generateImage("Person standing at the edge of a mysterious forest");

      // Speak the welcome message
      setTimeout(() => {
        speakText(
          `Welcome, ${input}! Your adventure begins now. You find yourself standing at the edge of a mysterious forest. The trees sway gently in the breeze, and you can hear strange sounds coming from deep within.`,
        );
      }, 100);
    } else {
      // Generate story continuation based on input
      generateStory(input);
    }
  };

  // Handle option selection
  const handleOptionSelect = (option) => {
    // Add selected option to history
    const newHistoryItem = {
      type: "player",
      text: option,
    };

    setGameState((prev) => ({
      ...prev,
      history: [...prev.history, newHistoryItem],
      showOptions: false,
      waitingForInput: false,
    }));

    // Generate story continuation based on selected option
    generateStory(option);
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Image display area */}
      <div className="relative w-full h-1/2 bg-gray-900">
        {gameState.isGeneratingImage ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <img
            src={gameState.currentImage || "/placeholder.svg"}
            alt="Scene"
            className="w-full h-full object-cover"
          />
        )}

        {/* Audio toggle button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
          onClick={toggleAudio}
        >
          {gameState.audioEnabled ? (
            <Volume2 className="h-5 w-5" />
          ) : (
            <VolumeX className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Text and interaction area */}
      <div className="flex-1 flex flex-col p-4 bg-gray-900 overflow-hidden">
        {/* Message history */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {gameState.history.map((item, index) => (
            <div
              key={index}
              className={clsx(
                "p-3 rounded-lg max-w-[80%]",
                item.type === "player"
                  ? "bg-primary text-primary-foreground ml-auto"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {item.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Current message */}
        <div className="mb-4 p-4 bg-gray-800 rounded-lg">
          {gameState.isGeneratingText ? (
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
            <p
              className={clsx(
                gameState.isSpeaking && "border-l-4 border-primary pl-2",
              )}
            >
              {gameState.currentMessage}
            </p>
          )}
        </div>

        {/* Input area */}
        {gameState.showOptions ? (
          <OptionSelector
            options={gameState.options}
            onSelect={handleOptionSelect}
            disabled={gameState.isGeneratingText}
          />
        ) : (
          <TextInput
            onSubmit={handleTextInput}
            disabled={!gameState.waitingForInput || gameState.isGeneratingText}
            placeholder={
              gameState.waitingForInput
                ? "What will you do?"
                : "Waiting for the story..."
            }
          />
        )}
      </div>
    </div>
  );
}
