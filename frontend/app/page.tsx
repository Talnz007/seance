import { SessionCreate } from '@/components/session/session-create';
import { SessionJoin } from '@/components/session/session-join';

export default function Home() {
  return (
    <main 
      className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950"
      role="main"
    >
      <div className="w-full max-w-4xl">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-10 md:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-3 sm:mb-4 text-purple-500 text-glow">
            Séance
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-300 mb-1.5 sm:mb-2 px-2">
            Connect with the AI spirit through the digital Ouija board
          </p>
          <p className="text-xs sm:text-sm md:text-base text-slate-400 px-2">
            Summon the spirit. Ask your questions. Receive cryptic wisdom.
          </p>
        </header>

        {/* Session Options */}
        <section 
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8"
          aria-label="Session options"
        >
          {/* Create Session */}
          <div className="space-y-3 sm:space-y-4">
            <h2 
              className="text-lg sm:text-xl md:text-2xl font-semibold text-purple-400 text-center"
              id="create-session-heading"
            >
              Create Session
            </h2>
            <SessionCreate />
          </div>

          {/* Join Session */}
          <div className="space-y-3 sm:space-y-4">
            <h2 
              className="text-lg sm:text-xl md:text-2xl font-semibold text-emerald-400 text-center"
              id="join-session-heading"
            >
              Join Session
            </h2>
            <SessionJoin />
          </div>
        </section>

        {/* Footer */}
        <footer 
          className="mt-8 sm:mt-10 md:mt-12 text-center text-slate-500 text-xs sm:text-sm px-2"
          role="contentinfo"
        >
          <p className="mb-1.5 sm:mb-2">
            <span aria-label="Features">✨ Multi-user sessions • Real-time spirit communication • Immersive audio</span>
          </p>
          <p className="text-xs">
            The veil between worlds grows thin...
          </p>
        </footer>
      </div>
    </main>
  );
}
