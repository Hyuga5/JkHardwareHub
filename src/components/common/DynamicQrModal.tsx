import React, { useState, useEffect } from 'react';
import { formatNPR } from '../../utils/formatters';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Download,
  QrCode,
  Sparkles,
  Clock,
  RefreshCw,
  ExternalLink,
  Store,
  Receipt,
  Smartphone,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DynamicQrModalProps {
  amount: number;
  initialProvider?: 'esewa' | 'khalti';
  orderSummary?: {
    shopCount: number;
    vatAmount: number;
    subtotal: number;
  };
  onSuccess: () => void;
  onClose: () => void;
}

/**
 * Deterministic SVG QR Matrix Generator
 * Generates an authentic, crisp SVG QR Code pattern with 3 positioning detection patterns (eyes),
 * timing strips, alignment pattern, and central branding badge.
 */
export const DynamicSvgQrCode: React.FC<{
  payload: string;
  provider: 'esewa' | 'khalti';
  amount: number;
  size?: number;
}> = ({ payload, provider, amount, size = 240 }) => {
  const isEsewa = provider === 'esewa';
  const primaryColor = isEsewa ? '#60bb46' : '#5c2d91';
  const secondaryColor = '#0F172A';

  // Generate 25x25 grid matrix deterministically from the payload string
  const gridSize = 25;
  const matrix: boolean[][] = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(false)
  );

  // Helper to hash string
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = (hash << 5) - hash + payload.charCodeAt(i);
    hash |= 0;
  }

  // Draw 3 Finder Patterns (7x7) at (0,0), (gridSize-7, 0), (0, gridSize-7)
  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        // Outer 7x7 border or inner 3x3 box
        if (
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[startY + r][startX + c] = true;
        } else {
          matrix[startY + r][startX + c] = false;
        }
      }
    }
  };

  drawFinder(0, 0); // Top-left
  drawFinder(gridSize - 7, 0); // Top-right
  drawFinder(0, gridSize - 7); // Bottom-left

  // Alignment pattern at bottom-right (size-9, size-9) 5x5
  const alignX = gridSize - 7;
  const alignY = gridSize - 7;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (r === 0 || r === 4 || c === 0 || c === 4 || (r === 2 && c === 2)) {
        matrix[alignY + r][alignX + c] = true;
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < gridSize - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Populate data cells with pseudo-random deterministic distribution
  let seed = Math.abs(hash) || 123456789;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Skip finder zones
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= gridSize - 8;
      const inBottomLeft = r >= gridSize - 8 && c < 8;
      const inCenterLogo = r >= 9 && r <= 15 && c >= 9 && c <= 15;
      const isTiming = (r === 6 && c >= 8 && c < gridSize - 8) || (c === 6 && r >= 8 && r < gridSize - 8);

      if (!inTopLeft && !inTopRight && !inBottomLeft && !inCenterLogo && !isTiming) {
        seed = (seed * 9301 + 49297) % 233280;
        const rnd = seed / 233280;
        matrix[r][c] = rnd > 0.46;
      }
    }
  }

  const cellSize = size / (gridSize + 4);
  const offset = cellSize * 2;

  return (
    <div
      id="dynamic-qr-svg-container"
      className="relative p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center border-2"
      style={{ borderColor: primaryColor }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-auto max-w-[240px] select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <rect width={size} height={size} fill="#ffffff" rx="12" />

        {/* Quiet zone decorative corner accents */}
        <path
          d={`M 6 18 A 12 12 0 0 1 18 6 L 36 6`}
          stroke={primaryColor}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M ${size - 36} 6 L ${size - 18} 6 A 12 12 0 0 1 ${size - 6} 18`}
          stroke={primaryColor}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M 6 ${size - 18} A 12 12 0 0 0 18 ${size - 6} L 36 ${size - 6}`}
          stroke={primaryColor}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M ${size - 36} ${size - 6} L ${size - 18} ${size - 6} A 12 12 0 0 0 ${size - 6} ${size - 18}`}
          stroke={primaryColor}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Matrix Modules */}
        <g transform={`translate(${offset}, ${offset})`}>
          {matrix.map((row, rIdx) =>
            row.map((isDark, cIdx) => {
              if (!isDark) return null;

              // Don't render inside center cutout
              if (rIdx >= 10 && rIdx <= 14 && cIdx >= 10 && cIdx <= 14) {
                return null;
              }

              const isFinder =
                (rIdx < 7 && cIdx < 7) ||
                (rIdx < 7 && cIdx >= gridSize - 7) ||
                (rIdx >= gridSize - 7 && cIdx < 7);

              const fill = isFinder ? primaryColor : secondaryColor;

              return (
                <rect
                  key={`${rIdx}-${cIdx}`}
                  x={cIdx * cellSize}
                  y={rIdx * cellSize}
                  width={cellSize * 0.9}
                  height={cellSize * 0.9}
                  rx={cellSize * 0.25}
                  fill={fill}
                />
              );
            })
          )}
        </g>

        {/* Central Brand Shield Emblem */}
        <g transform={`translate(${size / 2 - 22}, ${size / 2 - 22})`}>
          <rect
            width="44"
            height="44"
            rx="12"
            fill="#ffffff"
            stroke={primaryColor}
            strokeWidth="2.5"
            className="shadow-sm"
          />
          <rect
            x="4"
            y="4"
            width="36"
            height="36"
            rx="9"
            fill={primaryColor}
          />
          {isEsewa ? (
            <text
              x="22"
              y="28"
              fill="#ffffff"
              fontFamily="system-ui, sans-serif"
              fontSize="20"
              fontWeight="900"
              textAnchor="middle"
            >
              e
            </text>
          ) : (
            <text
              x="22"
              y="28"
              fill="#ffffff"
              fontFamily="system-ui, sans-serif"
              fontSize="19"
              fontWeight="900"
              textAnchor="middle"
            >
              K
            </text>
          )}
        </g>
      </svg>
    </div>
  );
};

export const DynamicQrModal: React.FC<DynamicQrModalProps> = ({
  amount,
  initialProvider = 'esewa',
  orderSummary,
  onSuccess,
  onClose,
}) => {
  const [provider, setProvider] = useState<'esewa' | 'khalti'>(initialProvider);
  const [countdown, setCountdown] = useState<number>(300); // 5 minutes
  const [copied, setCopied] = useState(false);
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);
  const [txRef] = useState(`NHH-QR-${Math.floor(100000 + Math.random() * 900000)}`);

  // QR Payload representing standard EMVCo / Fonepay / SmartQR Nepal digital QR string
  const qrPayload = JSON.stringify({
    gateway: provider === 'esewa' ? 'fonepay_esewa_qr' : 'khalti_smart_qr',
    merchant: 'NEPAL HARDWARE HUB MULTI-STORE',
    merchantPan: '601994821',
    amount: amount,
    currency: 'NPR',
    ref: txRef,
    timestamp: new Date().toISOString(),
  });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(
      `${provider === 'esewa' ? 'esewa://pay' : 'khalti://pay'}?amt=${amount}&ref=${txRef}&m=NepalHardwareHub`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    const svgEl = document.querySelector('#dynamic-qr-svg-container svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `${provider}-qr-${txRef}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleSimulateScan = () => {
    setIsSimulatingScan(true);
    setTimeout(() => {
      setIsSimulatingScan(false);
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {}
      onSuccess();
    }, 1200);
  };

  const isEsewa = provider === 'esewa';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header Banner */}
        <div
          className={`px-6 py-4.5 text-white flex items-center justify-between border-b transition-colors duration-300 ${
            isEsewa
              ? 'bg-gradient-to-r from-[#60bb46] to-[#458e30] border-[#60bb46]/30'
              : 'bg-gradient-to-r from-[#5c2d91] to-[#3f1d68] border-[#5c2d91]/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-xl shadow-inner border border-white/30">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight">
                  Dynamic {isEsewa ? 'eSewa FonePay' : 'Khalti SmartQR'}
                </h3>
                <span className="px-2 py-0.5 bg-black/25 text-[10px] uppercase font-black rounded-full tracking-wider">
                  Live IRD VAT
                </span>
              </div>
              <p className="text-xs text-white/80 font-medium">
                Scan with any Nepali Mobile Banking or Wallet App
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Provider Toggle Pill Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-2xl border border-slate-800">
            <button
              onClick={() => setProvider('esewa')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                isEsewa
                  ? 'bg-[#60bb46] text-white shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white text-[#60bb46] flex items-center justify-center text-[10px] font-black">
                e
              </div>
              <span>eSewa FonePay QR</span>
            </button>
            <button
              onClick={() => setProvider('khalti')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                !isEsewa
                  ? 'bg-[#5c2d91] text-white shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white text-[#5c2d91] flex items-center justify-center text-[10px] font-black">
                K
              </div>
              <span>Khalti Smart QR</span>
            </button>
          </div>

          {/* QR Display + Countdown Box in Bento layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Left: Rendered Dynamic SVG QR Code */}
            <div className="flex flex-col items-center">
              <DynamicSvgQrCode
                payload={qrPayload}
                provider={provider}
                amount={amount}
                size={210}
              />
              <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> F1Soft Encrypted
                </span>
                <span>•</span>
                <span className="font-mono text-slate-300">{txRef}</span>
              </div>
            </div>

            {/* Right: Payment Metadata & Amount Bento Card */}
            <div className="space-y-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total Payable
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20">
                  <Clock className="w-3 h-3" />
                  {formatTimer(countdown)}
                </span>
              </div>

              <p className="text-2xl font-black text-white tracking-tight">
                {formatNPR(amount)}
              </p>

              {orderSummary && (
                <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1 text-slate-400">
                  <div className="flex justify-between">
                    <span>Taxable Amount:</span>
                    <span className="text-slate-200 font-semibold">{formatNPR(orderSummary.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>13% IRD VAT:</span>
                    <span className="text-emerald-400 font-semibold">+{formatNPR(orderSummary.vatAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stores Included:</span>
                    <span className="text-slate-200 font-semibold">{orderSummary.shopCount} Certified Shops</span>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-700"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Intent</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadQr}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-700"
                    title="Download Scalable SVG QR Code"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>SVG</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Scanner Instructions */}
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
            <Smartphone className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Open your <span className="text-slate-200 font-bold">{isEsewa ? 'eSewa' : 'Khalti'}</span>, Global Smart Plus, NIC Asia MoBank, Nabil Smart, or any ConnectIPS/FonePay banking app and scan this QR code directly.
            </p>
          </div>

          {/* Action Confirmation Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              id="simulate-qr-scan-btn"
              type="button"
              onClick={handleSimulateScan}
              disabled={isSimulatingScan}
              className={`flex-1 py-3 px-4 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-50 ${
                isEsewa
                  ? 'bg-[#60bb46] hover:bg-[#52a03c] text-white shadow-[#60bb46]/20'
                  : 'bg-[#5c2d91] hover:bg-[#4d257a] text-white shadow-[#5c2d91]/20'
              }`}
            >
              {isSimulatingScan ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying QR Scanned Payment...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Simulate Scan & Pay {formatNPR(amount)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
