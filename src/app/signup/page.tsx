import Image from "next/image";
import { UtensilsCrossed } from "lucide-react";
import AuthForm from "../login/components/AuthForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen w-full flex bg-[#0a0a0a] text-white overflow-hidden">
      
      {/* Left side: Image Background */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-900">
        <Image
          src="/login/restaurant_bg.png"
          alt="Elegant Restaurant Atmosphere"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-between p-12">
          <div className="flex items-center gap-3 animate-fade-in-right">
            <div className="p-2 bg-orange-500/20 rounded-xl backdrop-blur-md border border-orange-500/30">
              <UtensilsCrossed className="w-8 h-8 text-orange-500" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Sabor&Arte</span>
          </div>

          <div className="max-w-md animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Descubra os melhores sabores da cidade.
            </h1>
            <p className="text-lg text-gray-300 font-light">
              Avalie, favorite e compartilhe suas experiências gastronômicas com uma comunidade apaixonada por comida.
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative bg-zinc-950">
        
        {/* Mobile Header Logo */}
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-3">
          <div className="p-2 bg-orange-500/20 rounded-xl backdrop-blur-md border border-orange-500/30">
            <UtensilsCrossed className="w-6 h-6 text-orange-500" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Sabor&Arte</span>
        </div>

        {/* Separated Client Component, loaded in signup/registration mode */}
        <AuthForm defaultIsLogin={false} />
      </div>
    </div>
  );
}
