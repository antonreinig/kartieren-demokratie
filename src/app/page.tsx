import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#EAEAEA] text-[#303030] p-4">
      <main className="flex w-full max-w-4xl flex-col items-center justify-center text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Kartieren <span className="text-[#F8CD32]">Demokratie</span>
          </h1>
          <p className="max-w-xl mx-auto text-xl md:text-2xl text-zinc-600">
            Ein Werkzeug für asynchrone Aushandlung, Perspektivwechsel und kollektives Wissen.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link href="/create">
            <Button className="rounded-full px-8 py-6 text-lg bg-[#F8CD32] hover:bg-[#E5BC2E] text-black shadow-lg hover:shadow-xl transition-all font-bold">
              Gedankenraum öffnen <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="https://github.com/antonreinig/kartieren-demokratie" target="_blank">
            <Button variant="outline" className="rounded-full px-8 py-6 text-lg border-2 hover:bg-white/50">
              <Github className="mr-2 w-5 h-5" /> Code ansehen
            </Button>
          </Link>
        </div>
      </main>

      <footer className="absolute bottom-8 text-sm text-zinc-500">
        Status: MVP / Testing Phase
      </footer>
    </div>
  );
}
