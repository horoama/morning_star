"use client";

import { useState, useEffect } from 'react';

export default function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!time) {
    return <div className="h-32 w-full animate-pulse bg-gray-800 rounded-xl"></div>;
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    }).format(date);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-900 rounded-2xl shadow-lg border border-gray-800">
      <div className="text-gray-400 text-lg md:text-xl font-medium mb-2 tracking-wide">
        {formatDate(time)}
      </div>
      <div className="text-6xl md:text-8xl font-black text-white tracking-wider font-mono bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
        {formatTime(time)}
      </div>
    </div>
  );
}
