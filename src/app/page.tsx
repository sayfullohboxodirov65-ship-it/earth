import { Navbar } from "@/components/navbar";
import { CommandPalette } from "@/components/command-palette";
import { Hero } from "@/components/hero";
import { BottomCards } from "@/components/bottom-cards";
import { PageSections } from "@/components/page-sections";
import { AmbientDock } from "@/components/ambient-music";
import { Starfield } from "@/components/starfield";

export default function Home() {
  return (
    <main className="relative">
      {/* Cinematic fixed deep-space backdrop (below all content) */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <Starfield density={0.32} />
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_80%_0%,rgba(70,110,190,0.07),transparent_55%),radial-gradient(80%_60%_at_10%_100%,rgba(168,255,158,0.04),transparent_60%)]" />
      </div>

      <div className="relative z-10">
        <Navbar />
        <CommandPalette />
        <AmbientDock />
        <Hero />
        <BottomCards />
        <PageSections />
      </div>
    </main>
  );
}
