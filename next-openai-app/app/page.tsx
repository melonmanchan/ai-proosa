"use client";

import { nanoid } from "ai";
import { useChat } from "ai/react";
import { useEffect } from "react";

export default function Chat() {
  const { messages } = useChat({
    initialMessages: [
      {
        id: nanoid(),
        role: "user",
        content: "Kirjoita lyhyt haiku suomeksi",
      },
    ],
  });

  useEffect(() => {
    async function doSubmit() {}

    doSubmit();
  }, []);
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.length > 0
        ? messages.map((m) => (
            <div key={m.id} className="whitespace-pre-wrap">
              {m.role === "user" ? "User: " : "AI: "}
              {m.content}
            </div>
          ))
        : null}
    </div>
  );
}
