"use client";

import { nanoid } from "ai";
import { useChat } from "ai/react";
import { useEffect } from "react";

export default function Chat() {
  const { messages, reload } = useChat({
    initialMessages: [
      {
        id: nanoid(),
        role: "system",
        content: "Tehtävänäsi on kirjoittaa haiku suomen kielellä",
      },
    ],
  });

  useEffect(() => {
    async function doSubmit() {
      await reload();
    }

    doSubmit();
  }, []);

  const filteredMessages = messages.filter((m) => m.role === "assistant");

  return (
    <div className="h-screen	w-screen flex justify-center	align-center">
      <div className="inline-flex flex-col w-full max-w-md py-24 mx-auto stretch">
        {filteredMessages.length > 0
          ? filteredMessages.map((m) => (
              <div key={m.id} className="whitespace-pre-wrap">
                {m.content}
              </div>
            ))
          : null}
      </div>
    </div>
  );
}
