"use client";

import { nanoid } from "ai";
import { useChat } from "ai/react";
import { useEffect, useRef } from "react";

import Background from "./Background";

const initialPrompt = `
Olet luova tekoäly, jonka tarkoitus on kirjoittaa runoja.
  Tehtävänäsi on kirjoittaa proosaruno. Runon logiikka on assosiatiivista, absurdia ja unenomaista ja se saa sisältää tarinallisia elementtejä.
  Runon ei tarvitse olla mittaan kirjoitettu. Käytä mielikuvitustasi ja anna runon viedä sinua. Pidä runo kuitenkin kohtuullisen lyhyenä ja ytimekkäänä.
`;

export default function Chat() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const { messages, reload } = useChat({
    initialMessages: [
      {
        id: nanoid(),
        role: "system",
        content: initialPrompt,
      },
    ],
  });

  //  useEffect(() => {
  //    async function doSubmit() {
  //      await reload();
  //    }
  //
  //    doSubmit();
  //  }, []);
  //

  useEffect(() => {
    window.addEventListener("click", (e) => {
      audioRef.current?.play();
    });
  }, []);

  const filteredMessages = messages.filter((m) => m.role === "assistant");

  return (
    <>
      <div
        className="h-screen	w-screen flex justify-center	align-center"
        onClick={() => {
          if (audioRef.current?.paused) {
            audioRef.current?.play();
          }
        }}
      >
        <audio ref={audioRef} src="/output.mp3" autoPlay loop />

        <div className="inline-flex flex-col w-full max-w-md py-24 mx-auto stretch justify-center">
          {filteredMessages.length > 0
            ? filteredMessages.map((m) => (
                <div
                  key={m.id}
                  className="whitespace-pre-wrap text-yellow-300 overflow-auto"
                >
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
