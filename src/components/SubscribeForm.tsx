"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "loading" | "success" | "error";

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setStatus("success");
      setMessage("You're on the list.");
      setEmail("");
    } else {
      const data = await res.json().catch(() => null);
      setStatus("error");
      setMessage(data?.error ?? "Something went wrong. Try again.");
    }
  }

  if (status === "success") {
    return <p className="text-base font-medium text-zinc-950 dark:text-zinc-50">{message}</p>;
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 sm:flex-row">
        <label htmlFor="email" className="sr-only">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 flex-1 rounded-full border border-black/[.08] bg-white px-5 text-base text-black outline-none focus:border-black/30 dark:border-white/[.145] dark:bg-black dark:text-white dark:focus:border-white/40"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-base font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-60 dark:hover:bg-[#ccc]"
        >
          {status === "loading" ? "Joining..." : "Notify me"}
        </button>
      </form>
      {status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
      )}
    </div>
  );
}
