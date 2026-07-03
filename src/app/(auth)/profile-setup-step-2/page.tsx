import { Step2Form } from "./_components/Step2Form";

export default function ProfileSetupStep2Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f7fafa]">
      <div className="w-full max-w-4xl">
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-1 w-12 rounded-full bg-[#01696f]" />
            <div className="h-1 w-12 rounded-full bg-[#e0e3e3]" />
          </div>
          <h1 className="text-4xl font-bold text-[#004f54] mb-2">Votre condition de santé</h1>
          <p className="text-lg text-[#3f4949]">
            Personnalisez votre expérience selon vos besoins médicaux et vos choix de vie.
          </p>
        </header>

        <Step2Form />

        <aside className="mt-12 flex justify-center">
          <div className="bg-white custom-shadow max-w-sm p-4 rounded-xl flex items-center gap-4 border border-[#bec8c9]/30">
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[#004f54]">smart_toy</span>
            </div>
            <p className="text-sm text-[#3f4949]">
              &ldquo;En choisissant &apos;Mode Sain&apos;, nous privilégierons les aliments à faible index glycémique.&rdquo;
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
