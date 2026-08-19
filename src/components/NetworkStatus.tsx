import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';

interface NetworkStatusProps {
  isGenerating?: boolean;
}

export const NetworkStatusIndicator: React.FC<NetworkStatusProps> = ({ isGenerating = false }) => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wasOfflineDuringGen, setWasOfflineDuringGen] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (isGenerating) {
        setWasOfflineDuringGen(true);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isGenerating]);

  // If status changed back to online, reset the generation alert after 4 seconds
  useEffect(() => {
    if (isOnline && wasOfflineDuringGen) {
      const timer = setTimeout(() => setWasOfflineDuringGen(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOfflineDuringGen]);

  return (
    <>
      {/* Floating Alert if Connection Lost During Generation */}
      {!isOnline && isGenerating && (
        <div
          id="network-lost-generating-alert"
          className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 max-w-md w-11/12 p-3.5 bg-rose-900/95 text-white border border-rose-700 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-bottom-3 duration-200"
        >
          <div className="p-2 rounded-xl bg-rose-800 text-rose-200 shrink-0">
            <WifiOff className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 text-xs">
            <p className="font-bold text-white text-[13px]">Network Connection Lost</p>
            <p className="text-rose-200 text-[11px] mt-0.5">
              Form generation may be delayed. Waiting for internet connection to restore...
            </p>
          </div>
        </div>
      )}

      {/* Footer Connectivity Badge */}
      <div
        id="footer-network-status"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
          isOnline
            ? 'bg-emerald-50/80 border-emerald-200/80 text-emerald-800'
            : 'bg-rose-50 border-rose-300 text-rose-800 animate-pulse'
        }`}
        title={
          isOnline
            ? 'Internet connection is active and stable'
            : 'Internet connection is offline. Please check your network.'
        }
      >
        {isOnline ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <Wifi className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="font-medium">Online</span>
          </>
        ) : (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 animate-ping" />
            <WifiOff className="w-3 h-3 text-rose-600 shrink-0" />
            <span className="font-bold">Offline</span>
          </>
        )}
      </div>
    </>
  );
};
