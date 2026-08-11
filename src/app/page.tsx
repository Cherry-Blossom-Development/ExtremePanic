import { SubscribeForm } from "@/components/SubscribeForm";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-10 px-6 py-32 text-center">
        <div className="flex flex-col items-center gap-4">
          <span className="text-sm font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Coming soon
          </span>
          <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight text-black sm:text-5xl dark:text-zinc-50">
            Extreme Panic
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Honest, hands-on reviews of the low-effort products everyone&apos;s
            buying — one unit purchased, photographed, and reviewed at a time.
          </p>
        </div>
        <SubscribeForm />
      </main>
    </div>
  );
}
