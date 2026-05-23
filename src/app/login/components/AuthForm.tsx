"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/services/apiClient";

interface AuthFormProps {
  defaultIsLogin?: boolean;
}

export default function AuthForm({ defaultIsLogin = true }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(defaultIsLogin);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [email, setEmail] = useState("demo@pratoideal.com");
  const [password, setPassword] = useState("senha123");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const router = useRouter();

  const toggleMode = () => {
    setIsLogin((prev) => !prev);
    setError("");
    setSuccessMsg("");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) return;
    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    if (!isLogin && password.length < 8) {
      setError("A senha deve conter no mínimo 8 caracteres.");
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (res?.error) {
          setError("E-mail ou senha incorretos.");
        } else {
          router.push("/");
          router.refresh();
        }
      } else {
        // O apiClient agora cuida do proxy automaticamente pelo baseURL
        await apiClient.post('/Usuario/cadastro', {
          nome: name,
          email: email,
          senha: password
        });
        
        // Cadastro com sucesso: Redireciona para login e mostra mensagem
        setIsLogin(true);
        setError("");
        setSuccessMsg("Conta criada com sucesso! Por favor, faça o login.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.message || err.response?.data?.error) {
         setError(err.response.data.message || err.response.data.error);
      } else {
         setError("Ocorreu um erro ao criar a conta. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? "login" : "register"}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full"
        >
          <motion.div variants={itemVariants} className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">
              {isLogin ? "Muito bem-vindo !" : "Crie sua conta"}
            </h2>
            <p className="text-zinc-400">
              {isLogin 
                ? "Entre para descobrir novos restaurantes" 
                : "Junte-se à nossa comunidade gastronômica"}
            </p>
          </motion.div>

          {error && (
            <motion.div variants={itemVariants} className="mb-4 p-3 flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center">
              <AlertCircle size={18} />
              <span>{error}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div variants={itemVariants} className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-sm text-center">
              {successMsg}
            </motion.div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <motion.div variants={itemVariants} className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-orange-500 transition-colors" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome completo" 
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all outline-none"
                  required={!isLogin}
                />
              </motion.div>
            )}

            <motion.div variants={itemVariants} className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-orange-500 transition-colors" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail" 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all outline-none"
                required
              />
            </motion.div>

            <motion.div variants={itemVariants} className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-orange-500 transition-colors" />
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha (mínimo 8 caracteres)" 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all outline-none"
                required
                minLength={!isLogin ? 8 : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </motion.div>

            {isLogin && (
              <motion.div variants={itemVariants} className="flex justify-end">
                <a href="#" className="text-sm text-zinc-400 hover:text-orange-400 transition-colors">
                  Esqueceu a senha?
                </a>
              </motion.div>
            )}

            <motion.div variants={itemVariants} className="flex items-center gap-2 mt-4">
              <input 
                type="checkbox" 
                id="terms" 
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-orange-500 focus:ring-orange-500 focus:ring-offset-zinc-950"
              />
              <label htmlFor="terms" className="text-sm text-zinc-400">
                Li e concordo com os <a href="/termos" target="_blank" className="text-orange-500 hover:underline">Termos de Uso</a> e a <a href="/privacidade" target="_blank" className="text-orange-500 hover:underline">Política de Privacidade</a>
              </label>
            </motion.div>

            <motion.button 
              type="submit"
              variants={itemVariants}
              whileHover={termsAccepted && !isLoading ? { scale: 1.01 } : {}}
              whileTap={termsAccepted && !isLoading ? { scale: 0.99 } : {}}
              disabled={!termsAccepted || isLoading}
              className={`w-full rounded-2xl py-4 font-semibold flex items-center justify-center gap-2 group transition-all outline-none ${
                termsAccepted && !isLoading
                  ? "bg-linear-to-r from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40" 
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? "Entrar" : "Criar conta"}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          <motion.div variants={itemVariants} className="mt-8 relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative bg-zinc-950 px-4 text-sm text-zinc-500">
              Ou continue com
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8 grid grid-cols-2 gap-4">
            <button 
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="flex items-center justify-center gap-3 py-3 px-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors focus:ring-2 focus:ring-orange-500 outline-none"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-sm font-medium">Google</span>
            </button>
            <button className="flex items-center justify-center gap-3 py-3 px-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors focus:ring-2 focus:ring-orange-500 outline-none">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.82 3.59-.82 1.5.06 2.53.64 3.24 1.48-2.69 1.66-2.2 4.96.34 6.05-.62 1.64-1.57 3.33-2.25 4.5v.96zm-1.84-14.8c.84-1.04 1.35-2.39 1.19-3.73-1.18.06-2.58.74-3.46 1.77-.73.81-1.34 2.18-1.1 3.58 1.25.1 2.54-.53 3.37-1.62z"/>
              </svg>
              <span className="text-sm font-medium">Apple</span>
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-10 text-center">
            <p className="text-zinc-400">
              {isLogin ? "Ainda não tem conta?" : "Já possui conta?"}{" "}
              <button 
                onClick={toggleMode}
                className="text-orange-500 font-medium hover:text-orange-400 transition-colors outline-none focus:underline"
              >
                {isLogin ? "Cadastre-se" : "Faça login"}
              </button>
            </p>
          </motion.div>

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
