"use client";

import { nanoid } from "ai";
import { useChat } from "ai/react";
import { useState, useRef } from "react";

import Background from "./Background";

const initialPrompt = `
Olet luova tekoäly, jonka tarkoitus on kirjoittaa runoja.
  Tehtävänäsi on kirjoittaa proosaruno. Runon logiikka on assosiatiivista, absurdia ja unenomaista ja se saa sisältää tarinallisia elementtejä.
  Runon ei tarvitse olla mittaan kirjoitettu. Käytä mielikuvitustasi ja anna runon viedä sinua. Pidä runo kuitenkin kohtuullisen lyhyenä ja ytimekkäänä.
`;

export default function Chat() {
  const musicRef = useRef<HTMLAudioElement>(null);
  const staticRef = useRef<HTMLAudioElement>(null);
  const [hasBeenClicked, setHasBeenClicked] = useState(false);

  const { messages, reload } = useChat({
    initialMessages: [
      {
        id: nanoid(),
        role: "system",
        content: initialPrompt,
      },
    ],

    onFinish: () => {
      setTimeout(() => {
        (window as any).hasBeenClicked = false;
        musicRef.current?.pause();
        staticRef.current?.play();
      }, 5000);
    },
  });

  const filteredMessages = messages.filter((m) => m.role === "assistant");

  return (
    <>
      <div
        className="h-screen	w-screen flex justify-center	align-center"
        onClick={() => {
          if (hasBeenClicked) {
            return;
          }

          staticRef.current?.play();

          setTimeout(() => {
            musicRef.current?.play();
            reload();

            setHasBeenClicked(true);

            (window as any).hasBeenClicked = true;
          }, 30);
        }}
      >
        <audio ref={musicRef} src="/output.mp3" />
        <audio ref={staticRef} src="/static.wav" />

        <div
          id="contents"
          className="inline-flex flex-col w-full max-w-md py-24 mx-auto stretch justify-center"
        >
          {hasBeenClicked ? null : (
            <div id="active-prompt" className="text-2xl text-center">
              Klikkaa aloittaaksesi...
            </div>
          )}

          {filteredMessages.length > 0
            ? filteredMessages.map((m) => (
                <div key={m.id} className="whitespace-pre-wrap overflow-auto">
                  {m.content}
                </div>
              ))
            : null}
        </div>
      </div>
      <Background />
    </>
  );
}
