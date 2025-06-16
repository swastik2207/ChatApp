



"use client"; // Required if you're using Next.js App Router

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"; // For App Router (Next.js 13+)
  // For Pages Router, use: import { useRouter } from "next/router";

export default function HeroSection() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/dashboard");
  };

  return (
    <section className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-gradient-to-b from-gray-50 to-white">
      <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
        Instant Chat Links for Seamless Conversations
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        QuickChat makes it effortless to create secure chat links and start
        conversations in seconds.
      </p>
      <Button size="lg" className="animate-pulse" onClick={handleClick}>
        Start Chatting
      </Button>

      <div className="mt-12 w-full max-w-5xl flex justify-center">
        <img
          src="/images/conversation.svg"
          alt="Illustration"
          className="w-full h-auto"
        />
      </div>
    </section>
  );
}
