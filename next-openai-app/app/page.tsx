"use client";

import { nanoid } from "ai";
import { useChat } from "ai/react";
import { useEffect, useState, useRef } from "react";

import Background from "./Background";

const initialPrompt = `
Olet luova tekoäly, jonka tarkoitus on kirjoittaa runoja.
  Tehtävänäsi on kirjoittaa proosaruno. Runon logiikka on assosiatiivista, absurdia ja unenomaista ja se saa sisältää tarinallisia elementtejä.
  Runon ei tarvitse olla mittaan kirjoitettu. Käytä mielikuvitustasi ja anna runon viedä sinua. Pidä runo kuitenkin kohtuullisen lyhyenä ja ytimekkäänä.
`;

export default function Chat() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [hasBeenClicked, setHasBeenClicked] = useState(false);

  const { messages, reload } = useChat({
    initialMessages: [
      {
        id: nanoid(),
        role: "system",
        content: initialPrompt,
      },
    ],
  });

  useEffect(() => {
    window.addEventListener("click", () => {
      audioRef.current?.play();
    });
  }, []);

  const filteredMessages = messages.filter((m) => m.role === "assistant");

  return (
    <>
      <div
        className="h-screen	w-screen flex justify-center	align-center"
        onClick={() => {
          if (hasBeenClicked) {
            return;
          }

          setTimeout(() => {
            audioRef.current?.play();
            reload();

            setHasBeenClicked(true);

            (window as any).hasBeenClicked = true;
          }, 50);
        }}
      >
        <audio ref={audioRef} src="/output.mp3" />

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
