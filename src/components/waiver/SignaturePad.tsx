'use client';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';

export interface SignaturePadHandle {
  getDataURL: () => string;
  isEmpty: () => boolean;
  clear: () => void;
}

const SignaturePad = forwardRef<SignaturePadHandle>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const [empty, setEmpty] = useState(true);

  useImperativeHandle(ref, () => ({
    getDataURL: () => canvasRef.current?.toDataURL('image/png') ?? '',
    isEmpty: () => empty,
    clear: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
      setEmpty(true);
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    function getPos(e: MouseEvent | TouchEvent): { x: number; y: number } {
      const rect = canvas!.getBoundingClientRect();
      const source = 'touches' in e ? e.touches[0] : e;
      return { x: source.clientX - rect.left, y: source.clientY - rect.top };
    }

    function start(e: MouseEvent | TouchEvent) {
      e.preventDefault();
      isDrawing.current = true;
      const { x, y } = getPos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
    function draw(e: MouseEvent | TouchEvent) {
      if (!isDrawing.current) return;
      e.preventDefault();
      const { x, y } = getPos(e);
      ctx.lineTo(x, y);
      ctx.stroke();
      setEmpty(false);
    }
    function stop() { isDrawing.current = false; }

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stop);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stop);

    return () => {
      canvas.removeEventListener('mousedown', start);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stop);
      canvas.removeEventListener('touchstart', start);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stop);
    };
  }, []);

  return (
    <div className="relative border-2 border-stone-200 rounded-2xl overflow-hidden bg-stone-50">
      <canvas
        ref={canvasRef}
        width={600}
        height={160}
        className="w-full touch-none cursor-crosshair"
        style={{ height: 160 }}
      />
      <button
        type="button"
        onClick={() => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
          setEmpty(true);
        }}
        className="absolute top-2 right-2 text-stone-400 hover:text-red-500 transition"
        title="Limpar assinatura"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      {empty && (
        <p className="absolute inset-0 flex items-center justify-center text-stone-300 pointer-events-none text-sm select-none">
          Assine aqui
        </p>
      )}
    </div>
  );
});

SignaturePad.displayName = 'SignaturePad';
export default SignaturePad;
