'use client';
import { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

interface Props {
  checkedIn: boolean;
  onCheckIn: () => void | Promise<void>;
}

export default function CheckInButton({ checkedIn, onCheckIn }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (checkedIn || loading) return;
    setLoading(true);
    try {
      await onCheckIn();
    } finally {
      setLoading(false);
    }
  }

  if (checkedIn) {
    return (
      <span className="flex items-center gap-1 text-green-400 font-semibold text-sm whitespace-nowrap">
        <CheckCircle className="w-5 h-5" /> Check-in
      </span>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm px-4 py-2 rounded-xl transition disabled:opacity-60 flex items-center gap-1 whitespace-nowrap"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check-in'}
    </button>
  );
}
