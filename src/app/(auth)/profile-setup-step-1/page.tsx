import { Step1Form } from "./_components/Step1Form";

export default function ProfileSetupStep1Page() {
  return (
    <div className="bg-[#f7fafa] min-h-screen text-[#181c1d]">
      {/* Progress Header */}
      <header className="fixed top-0 left-0 right-0 h-[60px] bg-[#f7fafa]/80 backdrop-blur-md z-50 flex items-center justify-center px-6">
        <div className="w-full max-w-[560px] flex flex-col gap-2">
          <div className="flex justify-between items-end mb-1">
            <span className="text-xs font-semibold text-[#004f54] uppercase tracking-widest">Étape 1 sur 2</span>
            <span className="text-xs font-semibold text-[#3f4949]">50% complété</span>
          </div>
          <div className="h-1.5 w-full bg-[#e0e3e3] rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-[#004f54] rounded-full transition-all duration-500" />
          </div>
        </div>
      </header>

      <main className="pt-[100px] pb-8 px-6 min-h-screen flex flex-col items-center">
        <div className="w-full max-w-[560px]">
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-4xl font-bold text-[#181c1d] mb-2">Créez votre profil santé</h1>
            <p className="text-lg text-[#3f4949]">
              Personnalisez votre expérience Smart Healthy pour des recommandations nutritionnelles précises.
            </p>
          </div>

          <Step1Form />

          {/* Info Card */}
          <div className="mt-6 bg-[#01696f] text-[#97e6ec] p-6 rounded-xl flex gap-4 items-start">
            <div className="bg-[#97e6ec]/20 p-2 rounded-lg">
              <span className="material-symbols-outlined">info</span>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-1">Pourquoi ces informations ?</h4>
              <p className="text-sm opacity-90">
                Ces données permettent de calculer votre métabolisme de base (TMB) et d&apos;ajuster
                vos besoins caloriques journaliers avec précision.
              </p>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 right-0 -z-10 opacity-10 pointer-events-none">
        <div className="w-96 h-96 bg-[#004f54] rounded-full blur-[100px] -mr-48 -mb-48" />
      </div>
    </div>
  );
}
