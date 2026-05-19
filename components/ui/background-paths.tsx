"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color:
      i % 3 === 0
        ? "rgba(11,31,51,0.42)"
        : i % 3 === 1
          ? "rgba(29,77,58,0.38)"
          : "rgba(201,168,76,0.30)",
    width: 0.5 + i * 0.03,
    duration: 20 + (i % 10),
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="h-full w-full"
        viewBox="0 0 696 316"
        fill="none"
        aria-hidden="true"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke={path.color}
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.03}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: path.duration,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export function BackgroundPaths({
  title = "Background Paths",
  showButton = true,
  mode = "full",
  className,
}: {
  title?: string;
  showButton?: boolean;
  mode?: "full" | "background";
  className?: string;
}) {
  const words = title.split(" ");

  if (mode === "background") {
    return (
      <div
        className={cn(
          "absolute inset-0 overflow-hidden pointer-events-none",
          className,
        )}
        style={{ backgroundColor: "#0B1F33" }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,31,51,0.95),rgba(11,31,51,0.88))]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(201,168,76,0.30),transparent)]" />
        <div className="absolute inset-0 opacity-34 [background-image:repeating-linear-gradient(45deg,rgba(255,255,255,0.05)_0_1px,transparent_1px_24px)]" />
        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden bg-[var(--color-deep)] text-white",
        className,
      )}
      style={{ backgroundColor: "#0B1F33" }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,31,51,0.95),rgba(11,31,51,0.88))]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(201,168,76,0.30),transparent)]" />
      <div className="absolute inset-0 opacity-34 [background-image:repeating-linear-gradient(45deg,rgba(255,255,255,0.05)_0_1px,transparent_1px_24px)]" />
      <div className="absolute inset-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16 text-center md:px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="mx-auto max-w-4xl"
        >
          <h1 className="mb-8 text-5xl font-bold tracking-tighter text-white sm:text-7xl md:text-8xl">
            {words.map((word, wordIndex) => (
              <span key={wordIndex} className="mr-4 inline-block last:mr-0">
                {word.split("").map((letter, letterIndex) => (
                  <motion.span
                    key={`${wordIndex}-${letterIndex}`}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: wordIndex * 0.1 + letterIndex * 0.03,
                      type: "spring",
                      stiffness: 150,
                      damping: 25,
                    }}
                    className="inline-block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>

          <p className="mx-auto max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
            Official document issuance and verification for the Galiyat Development
            Authority, built for public trust and institutional accountability.
          </p>

          {showButton ? (
            <div className="group mt-10 inline-block rounded-2xl bg-gradient-to-b from-[rgba(201,168,76,0.24)] to-[rgba(255,255,255,0.06)] p-px shadow-lg transition-shadow duration-300 hover:shadow-xl">
              <Button
                variant="ghost"
                className="rounded-[1.15rem] border border-white/10 bg-white/95 px-8 py-6 text-lg font-semibold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/100 hover:shadow-md dark:bg-black/95 dark:text-white"
              >
                <span className="opacity-90 transition-opacity group-hover:opacity-100">
                  Discover Excellence
                </span>
                <span className="ml-3 opacity-70 transition-all duration-300 group-hover:translate-x-1.5 group-hover:opacity-100">
                  →
                </span>
              </Button>
            </div>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
}
