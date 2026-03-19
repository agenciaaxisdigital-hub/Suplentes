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
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X size={20} />
        </Button>
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Assinatura</h2>
        <Button variant="ghost" size="icon" onClick={clear}>
          <Eraser size={20} className="text-muted-foreground" />
        </Button>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative bg-white">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none"
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
        {/* Guide line */}
        <div className="absolute bottom-[30%] left-8 right-8 border-b border-dashed border-muted-foreground/30 pointer-events-none" />
        <p className="absolute bottom-[30%] left-8 -translate-y-2 text-[10px] text-muted-foreground/40 pointer-events-none">
          Assine acima desta linha
        </p>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border bg-card pb-[env(safe-area-inset-bottom,12px)]">
        <Button
          onClick={save}
          disabled={!hasContent}
          className="w-full bg-gradient-to-r from-pink-500 to-rose-400 hover:opacity-90 text-white font-semibold h-12"
        >
          <Check size={20} />
          Confirmar Assinatura
        </Button>
      </div>
    </div>
  );
}
