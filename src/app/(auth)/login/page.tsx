import Image from "next/image";
import { AuthTabs } from "./_components/AuthTabs";

interface LoginPageProps {
  searchParams: Promise<{ registered?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { registered, error: errorMsg } = await searchParams;
  const justRegistered = registered === "true";

  return (
    <main className="flex min-h-screen">
      {/* Left Side */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-120 bg-white p-8 rounded-xl custom-shadow">
          {/* Brand */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[#004f54] text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                favorite
              </span>
              <span className="material-symbols-outlined text-[#004f54] text-[28px] -ml-4 mt-2" style={{ fontVariationSettings: "'FILL' 1" }}>
                eco
              </span>
            </div>
            <h1 className="text-4xl font-bold text-[#004f54] tracking-tight">Smart Healthy</h1>
            <p className="text-sm text-outline">Dietary Intelligence</p>
          </div>
          {errorMsg && (
            <p role="alert" className="mb-4 text-sm text-[#ae2f34] bg-[#ae2f34]/5 border border-[#ae2f34]/20 rounded-lg px-4 py-2 text-center">
              {errorMsg === "oauth_failed"
                ? "Connexion Google échouée. Réessayez."
                : errorMsg === "missing_code"
                ? "Code d&apos;authentification manquant."
                : errorMsg === "no_user"
                ? "Utilisateur introuvable après connexion."
                : "Une erreur s&apos;est produite lors de la connexion."}
            </p>
          )}
          {justRegistered && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm text-center">
              Compte créé avec succès ! Vérifiez vos emails pour confirmer votre adresse.
            </div>
          )}
          <AuthTabs />
        </div>
      </div>

      {/* Right Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#01696f]/10 p-8 flex-col justify-center relative overflow-hidden">
        <div className="relative z-10 max-w-lg mx-auto space-y-6">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-[#01696f]">Nutrition adaptée, vie simplifiée.</h2>
            <p className="text-lg text-on-surface-variant">Rejoignez une communauté qui prend soin de sa santé avec intelligence.</p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {[
              { name: "Marie, 42 ans", tag: "Diabétique", tagBg: "bg-[#a1f0f6] text-[#002022]", avatarBg: "bg-[#ffdad8]", desc: "Suivi de l'index glycémique et conseils personnalisés.", offset: "translate-x-4", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDeIh-EwEd_U3EifzO_LtAQur-S-ZQZJt22-1ZmkCsGxVRsSVfPdEYiIyhb7E9-zhiYwTY_7gDMh1oN6Wjmdz_R0MDm7WsLXJFUooqqR3PSp7kbQcsw3melI1NRCNUcRl-O1FZQT2GT6bwhkfiYOqG0mXw2XQyAqpVNWasnCPPTSGWQ_NsTwx9Q_cvbLcJAalMHJuoxb14OjAz_ybB-xARIxKYcDFN9pqdL1fM6somdWXinb7LPmJ1giNAjK5OgdVjONnis6C_0csCx" },
              { name: "Thomas, 28 ans", tag: "Cœliaque", tagBg: "bg-[#ffdbc9] text-[#331200]", avatarBg: "bg-[#ffdbc9]", desc: "Scan de produits instantané pour détecter le gluten.", offset: "-translate-x-4", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNWvxMq1JP82nyOLhL6nC5TtujHtU-ayS68UgEjyA0uxlqyPHbemJS11QhZpVKSXEGQNfYCZXo6olYhWzSZ0w6aN6CFjQ6SjBWiIc-4hriEMc5pcndXC7q1KMAaGWW0-19FQUnjg7JY3ebjmxjl6xP3KcopTSiSy6VNvBFdKVHqJPvIiM0scyOiESleIHbqLiQ3jaz_9rTJfc49NFw8GdzGjs684JXtwZxGAGqrSEMT00uHUdxt79AVjHtuYDeNWbqsF01hKBiWNL8" },
              { name: "Sophie, 35 ans", tag: "Healthy", tagBg: "bg-[#ff6b6b] text-white", avatarBg: "bg-[#85d3da]", desc: "Optimisation des micronutriments et recettes vitalité.", offset: "translate-x-8", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAd1_z87vFvICOlN5R6jBkgzcKZ8q9KQ50E2RouSQIDbnUSiWFnXNcCgZvX2yP9AcOO7qBW_v-Ho_OWyYV-WzBWzdtZJ4wuteaFtNqcSxNAdRel3UEFLiTqCVFSp2QCiSO2oMuJmoRA1JuQhSfDVE36BqPR4nGS6s86GcS6nsC2oacQuQd-Ug_9AKX3pmYuQi9GzZl1bz9sfjhHHh-AuVWu_UGafUkaOJeyXc2A4o0AMt6ooD7IxXo1kkK2-dkX6-3Z7R7NxDNS7M-m" },
            ].map((p) => (
              <div key={p.name} className={`bg-white p-6 rounded-xl custom-shadow flex items-center gap-6 ${p.offset}`}>
                <div className={`w-16 h-16 rounded-full overflow-hidden shrink-0 relative ${p.avatarBg}`}>
                  <Image fill className="object-cover" src={p.src} alt={p.name} sizes="64px" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-sm font-semibold text-[#181c1d]">{p.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${p.tagBg}`}>{p.tag}</span>
                  </div>
                  <p className="text-xs text-outline">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#01696f]/5 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#6e3815]/5 rounded-full -ml-48 -mb-48" />
      </div>
    </main>
  );
}
