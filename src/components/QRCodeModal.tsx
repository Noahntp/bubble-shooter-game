import React, { useState, useEffect } from 'react';
import { X, Copy, Check, QrCode, Smartphone, Sparkles } from 'lucide-react';
import QRCode from 'qrcode';

interface QRCodeModalProps {
  currentPhone?: string;
  onClose: () => void;
  onChangePhone: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  currentPhone,
  onClose,
  onChangePhone
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const currentUrl = window.location.href.split('?')[0];
    QRCode.toDataURL(currentUrl, {
      width: 280,
      margin: 1.5,
      color: {
        dark: '#030712',
        light: '#ffffff'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Lỗi tạo mã QR:', err));
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href.split('?')[0]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="modal-backdrop-20">
      {/* Ambient cyan glow */}
      <div className="absolute w-80 h-80 bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Spacious 20px Card */}
      <div className="modal-card-20">
        <div className="modal-top-beam-20" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Top Centered 3D QR Icon */}
        <div className="modal-icon-20">
          <QrCode size={26} />
        </div>

        {/* Title */}
        <h2 className="modal-title-20">
          Quét Mã QR Di Động
        </h2>
        <p className="modal-desc-20">
          Dùng camera điện thoại hoặc Zalo quét mã
        </p>

        {/* QR Code Container - 20px margin */}
        <div className="p-3 bg-white rounded-2xl shadow-2xl mb-5">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Mã QR Game"
              className="w-40 h-40 rounded-xl block"
            />
          ) : (
            <div className="w-40 h-40 flex items-center justify-center text-slate-500 text-xs font-bold">
              Đang tạo mã...
            </div>
          )}
        </div>

        {/* Current Phone Status */}
        {currentPhone && (
          <div className="mb-5 px-3.5 py-1.5 bg-amber-500/15 border border-amber-400/40 rounded-full text-xs text-amber-300 font-medium flex items-center gap-2">
            <Sparkles size={12} />
            <span>SĐT: <strong className="font-mono font-black">{currentPhone}</strong></span>
          </div>
        )}

        {/* Equal Action Buttons (50px, 20px gap) */}
        <div className="modal-btn-group-20 mb-0">
          <button
            type="button"
            onClick={handleCopy}
            className="modal-btn-20 modal-btn-secondary-20"
          >
            {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
            <span>{copied ? 'ĐÃ SAO CHÉP LIÊN KẾT!' : 'SAO CHÉP LINK GAME'}</span>
          </button>

          <button
            type="button"
            onClick={onChangePhone}
            className="modal-btn-20 modal-btn-secondary-20"
          >
            <Smartphone size={18} />
            <span>{currentPhone ? 'ĐỔI SỐ ĐIỆN THOẠI KHÁC' : 'NHẬP SỐ ĐIỆN THOẠI'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
