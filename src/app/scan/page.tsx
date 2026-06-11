'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from "@/components/ui/button";
import {
  Barcode,
  Camera,
  CameraOff,
  Loader2,
  FileImage,
  AlertTriangle,
  ScanLine,
  ChevronLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ScanPage() {
  const [scanning, setScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            const stopPromise = scannerRef.current.stop();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (stopPromise && typeof (stopPromise as any).catch === 'function') {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (stopPromise as any).catch(console.warn);
            }
          }
        } catch (e) {
          console.warn("Error stopping scanner cleanup", e);
        }

        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const clearPromise: any = scannerRef.current.clear();
          if (clearPromise && typeof clearPromise.catch === 'function') {
            clearPromise.catch(console.warn);
          }
        } catch (e) {
          console.warn("Error clearing scanner cleanup", e);
        }
      }
    };
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onScanSuccess = async (decodedText: string, decodedResult: any) => {
    console.log(`Code detected: ${decodedText}`);

    // Stop scanning immediately to prevent duplicate reads
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (e) { console.warn("Error stopping on success", e); }
      setScanning(false);
    }

    setIsLoading(true);

    // Check if it's a URL
    if (decodedText.startsWith('http')) {
      const confirmOpen = confirm(`Open link: ${decodedText}?`);
      if (confirmOpen) {
        window.location.href = decodedText;
        return;
      }
      setIsLoading(false);
      return;
    }

    // Navigate directly — the product page handles loading & not-found states
    // This avoids a double-fetch race condition
    if (decodedText.startsWith('fb-') || /^\d{6,14}$/.test(decodedText)) {
      toast.info("Barcode detected! Loading product...");
      router.push(`/product/${decodedText}`);
    } else {
      setError("Not a valid product barcode.");
      setIsLoading(false);
    }
  };


  const startScanning = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader");
      }

      // Helper to check permissions indirectly
      try {
        await Html5Qrcode.getCameras();
      } catch (e) {
        // ignore
      }

      const config = {
        fps: 10,
        qrbox: { width: 280, height: 280 },
        aspectRatio: 1.0,
        // experimentalFeature: {
        //     useBarCodeDetectorIfSupported: true
        // }
      };

      await scannerRef.current.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        (errorMessage) => {
          // ignore parsing errors
        }
      );

      setScanning(true);
      setIsLoading(false);

    } catch (err) {
      console.warn("Error starting scanner:", err);
      setIsLoading(false);
      setScanning(false);
      setError("Please allow camera access to scan.");
      toast.error("Camera access denied.");
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        setScanning(false);
      } catch (err) {
        console.warn("Failed to stop scanner", err);
      }
    }
  };

  const toggleScanning = () => {
    if (scanning) {
      stopScanning();
    } else {
      startScanning();
    }
  };

  const handleManualEntry = () => {
    const barcode = prompt("Enter barcode number manually:");
    if (barcode && barcode.trim().length > 0) {
      onScanSuccess(barcode, null);
    }
  };

  const handleImageScan = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    toast.info("Analyzing image...");

    try {
      // Use a separate instance or clear current? 
      // Safe to use a temp div or just the same reader if stopped
      if (scanning) await stopScanning();

      const html5Qrcode = new Html5Qrcode("reader-hidden");
      const result = await html5Qrcode.scanFile(file, false);
      html5Qrcode.clear();
      onScanSuccess(result, null);
    } catch (err) {
      console.warn("Error scanning file", err);
      setError("Could not detect barcode in image.");
      toast.error("No valid barcode found.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center p-3 sm:p-4 relative overflow-hidden bg-background">
      {/* Background Decor - Responsive */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-ingrecheck/30 blur-[60px] sm:blur-[80px] lg:blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-sky-500/30 blur-[50px] sm:blur-[80px] lg:blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <div className="w-full max-w-2xl z-10">
        <div className="mb-6 sm:mb-8 text-center">
          <Link href="/" className="inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-ingrecheck mb-3 sm:mb-4 transition-colors">
            <ChevronLeft size={16} className="mr-1" /> Back to Home
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-poppins mb-2 text-gradient">Scanner Active</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Align code within the frame to scan</p>
        </div>

        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-black/80 shadow-2xl border border-white/10 aspect-[4/5] md:aspect-video mx-auto max-h-[500px] sm:max-h-[600px] group">

          {/* Hidden File Reader */}
          <div id="reader-hidden" style={{ display: 'none' }}></div>

          {/* Main Camera View */}
          <div id="reader" className="w-full h-full relative z-10"></div>

          {/* HUD Overlay (Visible only when scanning) */}
          {scanning && (
            <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center p-4 sm:p-0">
              {/* Scanner reticle - Responsive */}
              <div className="relative w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 border border-white/20 rounded-lg">
                <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-t-4 border-l-4 border-ingrecheck rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-t-4 border-r-4 border-ingrecheck rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-b-4 border-l-4 border-ingrecheck rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-b-4 border-r-4 border-ingrecheck rounded-br-lg" />

                {/* Scanning Line */}
                <div className="absolute left-0 right-0 h-0.5 bg-ingrecheck/80 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-scan-line top-0" />
              </div>
              <p className="absolute bottom-6 sm:bottom-8 text-white/70 text-xs sm:text-sm font-mono animate-pulse">SEARCHING...</p>
            </div>
          )}

          {/* Idle / Loading / Error States */}
          {!scanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-30 p-6 text-center text-white">
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-ingrecheck animate-spin mb-3 sm:mb-4" />
                  <p className="text-base sm:text-lg font-medium">Processing scan...</p>
                </div>
              ) : error ? (
                <div className="bg-red-500/10 border border-red-500/50 p-4 sm:p-6 rounded-2xl max-w-sm mx-auto">
                  <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-2 sm:mb-3" />
                  <p className="text-sm sm:text-base text-red-200 font-medium">{error}</p>
                  <Button onClick={() => setError(null)} variant="link" className="text-white mt-2 text-xs sm:text-sm">Dismiss</Button>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto ring-1 ring-white/20">
                    <CameraOff className="w-8 h-8 sm:w-10 sm:h-10 text-white/50" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-1">Camera is Off</h3>
                    <p className="text-white/60 text-xs sm:text-sm">Tap "Start Scanning" to begin</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls - Responsive */}
        <div className="mt-6 sm:mt-8 grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
          <Button
            size="lg"
            onClick={toggleScanning}
            disabled={isLoading}
            className={`${scanning
              ? "bg-red-500 hover:bg-red-600 shadow-red-500/20"
              : "bg-ingrecheck hover:bg-ingrecheck-dark shadow-ingrecheck/20"
              } text-white shadow-lg h-12 sm:h-14 rounded-lg sm:rounded-xl col-span-2 md:col-span-1 text-sm sm:text-base`}
          >
            {scanning ? (
              <>
                <CameraOff className="mr-1 sm:mr-2 h-4 w-4" /> Stop
              </>
            ) : (
              <>
                <Camera className="mr-1 sm:mr-2 h-4 w-4" /> Start Scan
              </>
            )}
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={handleImageScan}
            disabled={isLoading || scanning}
            className="h-12 sm:h-14 rounded-lg sm:rounded-xl glass-panel border-white/10 hover:bg-white/5 text-sm sm:text-base"
          >
            <FileImage className="mr-1 sm:mr-2 h-4 w-4" /> Image
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={handleManualEntry}
            disabled={isLoading || scanning}
            className="h-12 sm:h-14 rounded-lg sm:rounded-xl glass-panel border-white/10 hover:bg-white/5 col-span-2 md:col-span-1 text-sm sm:text-base"
          >
            <Barcode className="mr-1 sm:mr-2 h-4 w-4" /> Manual
          </Button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
