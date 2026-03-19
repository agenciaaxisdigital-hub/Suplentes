import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Check, Eraser } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
  initial?: string;
}

export default function SignaturePad({ open, onClose, onSave, initial }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#1e1e1e";

      if (initial) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, rect.width, rect.height);
          setHasContent(true);
        };
        img.src = initial;
      }
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [open, initial]);

  const getPos = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const start = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setDrawing(true);
    const ctx = canvasRef.current!.getContext("2d")!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const move = (e: React.TouchEvent | React.MouseEvent) => {
    if (!drawing) return;
    e.preventDefault();
    const ctx = canvasRef.current!.getContext("2d")!;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasContent(true);
  };

  const end = () => setDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasContent(false);
  };

  const save = () => {
    const canvas = canvasRef.current!;
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col bg-background">
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 shrink-0">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Assinatura</h2>
          <Button variant="ghost" size="icon" onClick={clear}>
            <Eraser size={20} className="text-muted-foreground" />
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="relative min-h-0 flex-1 bg-card">
            <canvas
              ref={canvasRef}
              className="absolute inset-0 h-full w-full touch-none"
              onMouseDown={start}
              onMouseMove={move}
              onMouseUp={end}
              onMouseLeave={end}
              onTouchStart={start}
              onTouchMove={move}
              onTouchEnd={end}
            />
          </div>

          <div className="shrink-0 border-t border-border bg-background px-4 py-3 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-3 shadow-[0_-8px_24px_hsl(var(--foreground)/0.08)]">
            <p className="text-xs text-muted-foreground">Assine acima desta linha</p>
            <div className="border-b border-dashed border-border" />
            <Button
              onClick={save}
              disabled={!hasContent}
              className="h-12 w-full font-semibold"
            >
              <Check size={20} />
              Salvar assinatura
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
