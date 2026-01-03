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
              (stopPromise as any).catch(console.error);
            }
          }
        } catch (e) {
          console.error("Error stopping scanner cleanup", e);
        }

        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const clearPromise: any = scannerRef.current.clear();
          if (clearPromise && typeof clearPromise.catch === 'function') {
            clearPromise.catch(console.error);
          }
        } catch (e) {
          console.error("Error clearing scanner cleanup", e);
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
      } catch (e) { console.error("Error stopping on success", e); }
      setScanning(false);
    }

    setIsLoading(true);

    try {
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

      // Fetch product data
      toast.info("Analyzing barcode...");
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${decodedText}.json`);
      const data = await response.json();

      if (data.status === 1) {
        toast.success(`Product Found: ${data.product.product_name || 'Product'}`);
        router.push(`/product/${decodedText}`);
      } else {
        // Fallback for demo products check
        const demoProducts = ["54491472", "fb-soda-1", "fb-soda-2", "3017624010701", "737628064502"]; // Removed "demo" to force check

        if (demoProducts.includes(decodedText) || decodedText.startsWith('fb-')) {
          router.push(`/product/${decodedText}`);
          return;
        }

        // Relaxed fallback for valid-looking barcodes
        if (/^\d{8,14}$/.test(decodedText)) {
          toast.info("Unknown product, trying standard lookup...");
          router.push(`/product/${decodedText}`);
        } else {
          setError("Could not find product details.");
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      toast.error("Failed to connect to database.");
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
      console.error("Error starting scanner:", err);
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
        console.error("Failed to stop scanner", err);
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
      console.error("Error scanning file", err);
      setError("Could not detect barcode in image.");
      toast.error("No valid barcode found.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ingrecheck/30 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/30 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <div className="w-full max-w-2xl z-10">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-ingrecheck mb-4 transition-colors">
            <ChevronLeft size={16} className="mr-1" /> Back to Home
          </Link>
          <h1 className="text-4xl font-bold font-poppins mb-2 text-gradient">Scanner Active</h1>
          <p className="text-muted-foreground">Align code within the frame to scan</p>
        </div>

        <div className="relative rounded-3xl overflow-hidden bg-black/80 shadow-2xl border border-white/10 aspect-[4/5] md:aspect-video mx-auto max-h-[600px] group">

          {/* Hidden File Reader */}
          <div id="reader-hidden" style={{ display: 'none' }}></div>

          {/* Main Camera View */}
          <div id="reader" className="w-full h-full relative z-10"></div>

          {/* HUD Overlay (Visible only when scanning) */}
          {scanning && (
            <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
              {/* Scanner reticle */}
              <div className="relative w-64 h-64 border border-white/20 rounded-lg">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-ingrecheck rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-ingrecheck rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-ingrecheck rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-ingrecheck rounded-br-lg" />

                {/* Scanning Line */}
                <div className="absolute left-0 right-0 h-0.5 bg-ingrecheck/80 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-scan-line top-0" />
              </div>
              <p className="absolute bottom-8 text-white/70 text-sm font-mono animate-pulse">SEARCHING...</p>
            </div>
          )}

          {/* Idle / Loading / Error States */}
          {!scanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-30 p-8 text-center text-white">
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="w-16 h-16 text-ingrecheck animate-spin mb-4" />
                  <p className="text-lg font-medium">Processing scan...</p>
                </div>
              ) : error ? (
                <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl max-w-sm">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                  <p className="text-red-200 font-medium">{error}</p>
                  <Button onClick={() => setError(null)} variant="link" className="text-white mt-2">Dismiss</Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 ring-1 ring-white/20">
                    <CameraOff className="w-10 h-10 text-white/50" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Camera is Off</h3>
                    <p className="text-white/60 text-sm">Tap "Start Scanning" to begin</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
          <Button
            size="lg"
            onClick={toggleScanning}
            disabled={isLoading}
            className={`${scanning
              ? "bg-red-500 hover:bg-red-600 shadow-red-500/20"
              : "bg-ingrecheck hover:bg-ingrecheck-dark shadow-ingrecheck/20"
              } text-white shadow-lg h-14 rounded-xl col-span-2 md:col-span-1`}
          >
            {scanning ? (
              <>
                <CameraOff className="mr-2" /> Stop
              </>
            ) : (
              <>
                <Camera className="mr-2" /> Start Scan
              </>
            )}
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={handleImageScan}
            disabled={isLoading || scanning}
            className="h-14 rounded-xl glass-panel border-white/10 hover:bg-white/5"
          >
            <FileImage className="mr-2 h-5 w-5" /> Image
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={handleManualEntry}
            disabled={isLoading || scanning}
            className="h-14 rounded-xl glass-panel border-white/10 hover:bg-white/5 col-span-2 md:col-span-1"
          >
            <Barcode className="mr-2 h-5 w-5" /> Manual
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
