import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LogIn, Lock, User } from "lucide-react";
import Hyperspeed from "@/components/Hyperspeed";
import { toast } from "@/hooks/use-toast";

const EMAIL_DOMAIN = "@painel.sarelli.com";

const DOCTOR_PHOTO =
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699400706d955b03c8c19827/16e72069d_WhatsAppImage2026-02-17at023641.jpeg";

// Elegant deep pink Hyperspeed preset
const hyperspeedPreset = {
  onSpeedUp: () => {},
  onSlowDown: () => {},
  distortion: 'deepDistortion',
  length: 600,
  roadWidth: 8,
  islandWidth: 3,
  lanesPerRoad: 2,
  fov: 80,
  fovSpeedUp: 120,
  speedUp: 3,
  carLightsFade: 0.35,
  totalSideLightSticks: 30,
  lightPairsPerRoadWay: 60,
  shoulderLinesWidthPercentage: 0.03,
  brokenLinesWidthPercentage: 0.08,
  brokenLinesLengthPercentage: 0.6,
  lightStickWidth: [0.08, 0.35],
  lightStickHeight: [1.5, 2.1],
  movingAwaySpeed: [80, 120],
  movingCloserSpeed: [-150, -200],
  carLightsLength: [600 * 0.05, 600 * 0.15],
  carLightsRadius: [0.03, 0.1],
  carWidthPercentage: [0.2, 0.4],
  carShiftX: [-0.6, 0.6],
  carFloorSeparation: [0.5, 3],
  colors: {
    roadColor: 0x0a0408,
    islandColor: 0x0c060a,
    background: 0x000000,
    shoulderLines: 0x2a1020,
    brokenLines: 0x2a1020,
    leftCars: [0xec4899, 0xf9a8d4, 0xbe185d, 0xfda4af],
    rightCars: [0xf43f5e, 0xff6b9d, 0xc026d3, 0xe879f9],
    sticks: 0xf472b6,
  }
};

export default function Login() {
  const [username, setUsername] = useState(() => localStorage.getItem("saved_user") || "");
  const [password, setPassword] = useState(() => localStorage.getItem("saved_pass") || "");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(() => !!localStorage.getItem("saved_user"));
  const navigate = useNavigate();

  // Memoize to prevent re-renders
  const preset = useMemo(() => hyperspeedPreset, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const email = username.includes("@")
      ? username
      : username.toLowerCase().replace(/\s+/g, "") + EMAIL_DOMAIN;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      toast({
        title: "Erro no login",
        description: "Usuário ou senha incorretos",
        variant: "destructive",
      });
    } else {
      if (remember) {
        localStorage.setItem("saved_user", username);
        localStorage.setItem("saved_pass", password);
      } else {
        localStorage.removeItem("saved_user");
        localStorage.removeItem("saved_pass");
      }
      navigate("/");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#0d0610] via-[#10080c] to-[#080406] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Hyperspeed background */}
      <Hyperspeed effectOptions={preset} />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/30 z-[1]" />

      <div className="w-full max-w-sm space-y-6 relative z-10">
        {/* Photo + Identity */}
        <div className="text-center space-y-3">
          <div className="relative mx-auto w-28 h-28">
            {/* Pink ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 to-rose-400 p-[3px]">
              <div className="w-full h-full rounded-full overflow-hidden bg-black">
                <img
                  src={DOCTOR_PHOTO}
                  alt="Dra. Fernanda Sarelli"
                  className="w-full h-full object-cover"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
            </div>
            {/* Online indicator */}
            <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-black" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Dra. Fernanda Sarelli
            </h1>
            <p className="text-xs font-medium text-pink-400 uppercase tracking-widest mt-1">
              Painel de Suplentes
            </p>
          </div>

          <p className="text-[11px] text-white/40">
            Acesso exclusivo da equipe
          </p>
        </div>

        {/* Login form */}
        <form
          onSubmit={handleLogin}
          className="space-y-4 bg-black/60 backdrop-blur-xl p-6 rounded-2xl border border-white/[0.08] shadow-[0_8px_32px_hsl(340_82%_55%/0.15)]"
        >
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-widest text-white/50 font-medium">
              Usuário
            </Label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
              />
              <Input
                type="text"
                placeholder="Ex: Administrador"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/25 focus:border-pink-500/50 focus:ring-pink-500/20 h-11 pl-10 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-widest text-white/50 font-medium">
              Senha
            </Label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
              />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/25 focus:border-pink-500/50 focus:ring-pink-500/20 h-11 pl-10 pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Lembrar credenciais */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={remember}
              onCheckedChange={(v) => setRemember(!!v)}
              className="border-white/20 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
            />
            <label htmlFor="remember" className="text-xs text-white/50 cursor-pointer select-none">
              Lembrar meus dados
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-semibold h-11 text-sm shadow-[0_4px_16px_hsl(340_82%_55%/0.3)] transition-all active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Entrando...
              </div>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn size={16} />
                Entrar
              </span>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center space-y-1">
          <p className="text-[10px] text-white/25">
            Pré-candidata a Deputada Estadual — GO 2026
          </p>
          <a
            href="https://drafernandasarelli.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-pink-500/50 hover:text-pink-400 transition-colors"
          >
            drafernandasarelli.com.br
          </a>
        </div>
      </div>
    </div>
  );
}
