import React, { useState } from 'react';
import { formatNPR } from '../../utils/formatters';
import { ShieldCheck, CheckCircle2, AlertCircle, X, Lock, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';

interface EsewaModalProps {
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
}

export const EsewaModal: React.FC<EsewaModalProps> = ({ amount, onSuccess, onClose }) => {
  const [esewaId, setEsewaId] = useState('9841234567');
  const [mpin, setMpin] = useState('1234');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!esewaId || !mpin) {
      setError('Please enter eSewa ID and MPIN');
      return;
    }

    setIsProcessing(true);
    setError('');

    setTimeout(() => {
      setIsProcessing(false);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
      onSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* eSewa Header */}
        <div className="bg-[#60bb46] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-[#60bb46] text-lg shadow-xs">
              e
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">eSewa Nepal Checkout</h3>
              <p className="text-xs text-emerald-100">Secure Digital Payment Gateway</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center">
            <div>
              <p className="text-xs text-emerald-800 font-medium">Payable Amount</p>
              <p className="text-xl font-bold text-emerald-950">{formatNPR(amount)}</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-full text-xs font-semibold">
              Live Gateway
            </span>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              eSewa ID / Mobile Number
            </label>
            <div className="relative">
              <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={esewaId}
                onChange={(e) => setEsewaId(e.target.value)}
                placeholder="98XXXXXXXX"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              4-Digit MPIN / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                maxLength={4}
                value={mpin}
                onChange={(e) => setMpin(e.target.value)}
                placeholder="••••"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 tracking-widest font-bold"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Pre-filled with test credentials for demo</p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 bg-[#60bb46] hover:bg-[#52a03c] active:bg-[#478e33] text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authorizing with eSewa...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Confirm Payment of {formatNPR(amount)}</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>256-Bit SSL Encrypted by F1Soft Nepal</span>
          </div>
        </form>
      </div>
    </div>
  );
};

interface KhaltiModalProps {
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
}

export const KhaltiModal: React.FC<KhaltiModalProps> = ({ amount, onSuccess, onClose }) => {
  const [mobile, setMobile] = useState('9801234567');
  const [mpin, setMpin] = useState('1234');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || !mpin) {
      setError('Please enter Khalti Mobile Number and PIN');
      return;
    }

    setIsProcessing(true);
    setError('');

    setTimeout(() => {
      setIsProcessing(false);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
      onSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Khalti Header */}
        <div className="bg-[#5c2d91] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-[#5c2d91] text-lg shadow-xs">
              K
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Khalti Digital Wallet</h3>
              <p className="text-xs text-purple-200">Nepal's Payment Gateway</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 flex justify-between items-center">
            <div>
              <p className="text-xs text-purple-800 font-medium">Amount to Pay</p>
              <p className="text-xl font-bold text-purple-950">{formatNPR(amount)}</p>
            </div>
            <span className="px-2.5 py-1 bg-[#5c2d91] text-white rounded-full text-xs font-semibold">
              Instant Pay
            </span>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Khalti Mobile Number
            </label>
            <div className="relative">
              <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="98XXXXXXXX"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Khalti Transaction PIN / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                maxLength={6}
                value={mpin}
                onChange={(e) => setMpin(e.target.value)}
                placeholder="••••"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 tracking-widest font-bold"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Pre-filled with test credentials</p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 bg-[#5c2d91] hover:bg-[#4d257a] active:bg-[#3f1e63] text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Khalti OTP...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Pay {formatNPR(amount)} via Khalti</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-purple-600" />
            <span>Sparrow Pay Nepal Certified Partner</span>
          </div>
        </form>
      </div>
    </div>
  );
};

interface OtpModalProps {
  phone: string;
  onVerified: () => void;
  onClose: () => void;
}

export const OtpModal: React.FC<OtpModalProps> = ({ phone, onVerified, onClose }) => {
  const [otp, setOtp] = useState('8842');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onVerified();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="text-center">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Smartphone className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Phone Verification</h3>
          <p className="text-xs text-slate-500 mt-1">
            We sent a 4-digit SMS OTP code to <span className="font-semibold text-slate-800">{phone}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="mt-6 space-y-4">
          <div>
            <input
              type="text"
              maxLength={4}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full text-center text-2xl font-bold tracking-widest py-3 border-2 border-amber-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="0000"
              required
            />
            <p className="text-[11px] text-center text-slate-400 mt-1.5">
              Code pre-filled (Test OTP: 8842)
            </p>
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition cursor-pointer"
          >
            {isVerifying ? 'Verifying Phone...' : 'Verify & Continue'}
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="w-full py-1 text-xs text-slate-400 hover:text-slate-600"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};
