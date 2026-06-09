import Image from "next/image";
import Link from "next/link";
import AuthForm from "@/components/features/auth/AuthForm";

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
          <Link href="/" className="flex items-center gap-3.5 animate-fade-in-right group shrink-0 w-fit">
            <Image
              src="/logo-icon-128.png"
              alt="Logo Prato Ideal"
              width={48}
              height={48}
              className="object-contain transition-transform duration-500 group-hover:rotate-15"
            />
            <span className="text-2xl font-black tracking-tight bg-linear-to-r from-[#B33817] to-[#DD9318] bg-clip-text text-transparent font-outfit">
              Prato Ideal
            </span>
          </Link>

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
        <Link href="/" className="absolute top-8 left-8 lg:hidden flex items-center gap-2.5 group">
          <Image
            src="/logo-icon-48.png"
            alt="Logo Prato Ideal"
            width={32}
            height={32}
            className="object-contain transition-transform duration-500 group-hover:rotate-15"
          />
          <span className="text-xl font-extrabold tracking-tight bg-linear-to-r from-[#B33817] to-[#DD9318] bg-clip-text text-transparent font-outfit">
            Prato Ideal
          </span>
        </Link>

        {/* Separated Client Component, loaded in signup/registration mode */}
        <AuthForm defaultIsLogin={false} />
      </div>
    </div>
  );
}
