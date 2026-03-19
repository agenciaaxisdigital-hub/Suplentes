import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Usuarios() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setLoading(true);
    const { data, error } = await supabase.functions.invoke("create-user", {
      body: { username: username.trim(), password },
    });
    setLoading(false);

    if (error || data?.error) {
      toast({
        title: "Erro ao criar usuário",
        description: data?.error || error?.message || "Tente novamente",
        variant: "destructive",
      });
    } else {
      toast({ title: "Usuário criado com sucesso!" });
      setUsername("");
      setPassword("");
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Criar Usuário</h1>

      <form onSubmit={handleCreate} className="space-y-4 bg-card rounded-2xl border border-border p-5 shadow-sm">
        <div className="space-y-1.5">
          <Label className="text-sm text-muted-foreground">Nome de usuário</Label>
          <Input
            placeholder="Ex: joao"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="bg-card shadow-sm border-border"
          />
          <p className="text-[11px] text-muted-foreground">
            Login será: <span className="font-medium text-foreground">{username.trim().toLowerCase().replace(/\s+/g, "") || "..."}</span>
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm text-muted-foreground">Senha</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-card shadow-sm border-border pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full gap-2">
          {loading ? (
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <UserPlus size={16} />
          )}
          {loading ? "Criando..." : "Criar Usuário"}
        </Button>
      </form>
    </div>
  );
}
