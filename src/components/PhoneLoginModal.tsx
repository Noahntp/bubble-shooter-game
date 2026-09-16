import React, { useState, useEffect } from 'react';
import { Sparkles, Gift, QrCode, Target, Zap, AlertCircle, CheckCircle2, Smartphone, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';
import { apiService } from '../services/api';

interface PhoneLoginModalProps {
  initialPhone?: string;
  onSuccess: (phone: string) => void;
  onClose?: () => void;
}

export const PhoneLoginModal: React.FC<PhoneLoginModalProps> = ({
  initialPhone,
  onSuccess,
  onClose
}) => {
  const [phone, setPhone] = useState(initialPhone || '');
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'form' | 'qr'>('form');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Generate QR Code URL
  useEffect(() => {
    const currentUrl = window.location.href.split('?')[0];
    QRCode.toDataURL(currentUrl, {
      width: 260,
      margin: 1.5,
      color: {
        dark: '#030712',
        light: '#ffffff'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Lỗi tạo mã QR:', err));
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    setPhone(rawVal);
    if (error) setError(null);
  };

  // Flexible validation: accepts any standard phone number (9 to 11 digits, including 0123456789 for test)
  const cleanDigits = phone.replace(/\D/g, '');
  const isValid = cleanDigits.length >= 9 && cleanDigits.length <= 11;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanDigits) {
      setError('Vui lòng nhập số điện thoại');
      return;
    }

    if (!isValid) {
      setError('Số điện thoại hợp lệ gồm 10 chữ số');
      return;
    }

    // Save phone in service & proceed immediately
    apiService.setPlayerPhone(cleanDigits);
    onSuccess(cleanDigits);
  };

  const handleCopyLink = () => {
    const currentUrl = window.location.href.split('?')[0];
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop-20">
      {/* Glow */}
      <div className="absolute w-80 h-80 bg-gradient-to-tr from-amber-500/20 via-cyan-500/20 to-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Spacious 20px Card */}
      <div className="modal-card-20">
        <div className="modal-top-beam-20" />

        {viewMode === 'form' ? (
          <div className="w-full flex flex-col items-center">
            {/* Top Icon */}
            <div className="modal-icon-20">
              <Sparkles size={24} />
            </div>

            {/* Title & Subtitle */}
            <h2 className="modal-title-20">
              Nhập Số Điện Thoại
            </h2>
            <p className="modal-desc-20">
              Nhận ngay quà tân thủ và lưu điểm
            </p>

            {/* Unified Golden Reward Bar */}
            <div className="modal-banner-20">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/25 border border-cyan-400/50 text-cyan-300 flex items-center justify-center shadow-sm">
                  <Target size={15} />
                </div>
                <div className="text-left leading-tight">
                  <div className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">Thêm lượt</div>
                  <div className="text-xs sm:text-sm font-black text-white">+5 Lượt</div>
                </div>
              </div>

              <div className="w-[1px] h-6 bg-white/20" />

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/25 border border-amber-400/50 text-amber-300 flex items-center justify-center shadow-sm">
                  <Zap size={15} />
                </div>
                <div className="text-left leading-tight">
                  <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Khởi đầu</div>
                  <div className="text-xs sm:text-sm font-black text-amber-300">+500 Điểm</div>
                </div>
              </div>
            </div>

            {/* Phone Input Form */}
            <form onSubmit={handleSubmit} className="w-full">
              {/* Input Container */}
              <div 
                className="w-full h-[50px] flex items-center bg-slate-950/95 border-2 border-cyan-400/60 focus-within:border-cyan-300 focus-within:ring-2 focus-within:ring-cyan-400/30 rounded-2xl overflow-hidden shadow-inner transition-all box-border mb-1.5"
              >
                {/* Prefix Box with Explicit Dimensions for Flag and +84 */}
                <div 
                  className="flex items-center gap-2 h-full bg-slate-900/95 border-r border-white/20 shrink-0 select-none px-3.5"
                  style={{ minWidth: '82px' }}
                >
                  {/* Robust Non-Collapsible Vietnam SVG Flag */}
                  <div 
                    className="shrink-0 rounded-[3px] overflow-hidden shadow-sm flex items-center justify-center"
                    style={{ width: '24px', height: '16px', minWidth: '24px', minHeight: '16px' }}
                  >
                    <svg 
                      width="24" 
                      height="16" 
                      viewBox="0 0 30 20" 
                      style={{ width: '24px', height: '16px', display: 'block' }}
                      aria-label="Vietnam"
                    >
                      <rect width="30" height="20" fill="#da251d" />
                      <polygon
                        points="15,4 16.5,8.8 21.5,8.8 17.5,11.8 19,16.5 15,13.6 11,16.5 12.5,11.8 8.5,8.8 13.5,8.8"
                        fill="#ffff00"
                      />
                    </svg>
                  </div>

                  <span className="font-heading text-sm font-black text-amber-400 tracking-tight leading-none">
                    +84
                  </span>
                </div>

                {/* Main Phone Input */}
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="09xx xxx xxx"
                  maxLength={11}
                  className="flex-1 h-full bg-transparent px-3.5 text-white font-heading text-base font-bold placeholder:text-slate-500 focus:outline-none tracking-wider"
                  autoFocus
                />

                {isValid && (
                  <div className="pr-3 text-emerald-400 shrink-0 flex items-center">
                    <CheckCircle2 size={20} />
                  </div>
                )}
              </div>

              {/* Input Hint */}
              <div className="mb-3.5 px-1 text-left">
                {error ? (
                  <div className="flex items-center gap-1.5 text-rose-400 text-xs font-medium">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400">
                    * Nhập 10 chữ số di động (Ví dụ: 0912 345 678)
                  </p>
                )}
              </div>

              {/* Action Buttons Group */}
              <div className="modal-btn-group-20">
                <button
                  type="submit"
                  className="modal-btn-20 modal-btn-gold-20"
                >
                  <Gift size={18} />
                  <span>NHẬN QUÀ &amp; VÀO CHƠI NGAY</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('qr')}
                  className="modal-btn-20 modal-btn-secondary-20"
                >
                  <QrCode size={18} className="text-cyan-400" />
                  <span>MÃ QR CHƠI TRÊN ĐIỆN THOẠI</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* VIEW 2: MÃ QR */
          <div className="w-full flex flex-col items-center">
            {/* Top Icon */}
            <div className="modal-icon-20">
              <QrCode size={24} />
            </div>

            <h2 className="modal-title-20">
              Quét Mã Để Chơi
            </h2>
            <p className="modal-desc-20">
              Dùng camera điện thoại hoặc Zalo quét mã
            </p>

            {/* QR Frame */}
            <div className="p-3 bg-white rounded-2xl shadow-xl mb-3.5">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Mã QR Game"
                  className="w-36 h-36 rounded-xl block"
                />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center text-slate-500 text-xs font-bold">
                  Đang tạo mã...
                </div>
              )}
            </div>

            {/* Equal Buttons */}
            <div className="modal-btn-group-20">
              <button
                type="button"
                onClick={handleCopyLink}
                className="modal-btn-20 modal-btn-secondary-20"
              >
                {copied ? <Check size={17} className="text-emerald-400" /> : <Copy size={17} />}
                <span>{copied ? 'ĐÃ SAO CHÉP LIÊN KẾT!' : 'SAO CHÉP LINK GAME'}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('form')}
                className="modal-btn-20 modal-btn-secondary-20"
              >
                <Smartphone size={17} />
                <span>← NHẬP SỐ ĐIỆN THOẠI</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
