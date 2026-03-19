import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const EMAIL_DOMAIN = "@painel.sarelli.com";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const email = username.includes("@") ? username : username.toLowerCase().replace(/\s+/g, "") + EMAIL_DOMAIN;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Erro no login", description: "Usuário ou senha incorretos", variant: "destructive" });
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-rose-400 to-pink-300 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 mx-auto rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-white">FS</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Painel de Suplentes</h1>
          <p className="text-sm text-white/80">Dra. Fernanda Sarelli</p>
          <p className="text-xs text-white/60">Acesso restrito à equipe</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-2xl">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-white/70">Usuário</Label>
            <Input
              type="text"
              placeholder="Ex: Administrador"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/50"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-white/70">Senha</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-pink-600 hover:bg-white/90 font-semibold h-12 text-base shadow-lg"
          >
            {loading ? "Entrando..." : <><LogIn size={18} /> Entrar</>}
          </Button>
        </form>

        <p className="text-center text-[10px] text-white/40">
          Pré-candidata a Deputada Estadual — GO 2026
        </p>
      </div>
    </div>
  );
}
