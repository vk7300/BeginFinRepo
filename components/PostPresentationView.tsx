import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

// Pre-computed fallback QR code data URL pointing to https://begin-fin.com/
const DEFAULT_QR_URL = 'data:image/png;base64,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';

export const PostPresentationView: React.FC = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>(DEFAULT_QR_URL);

  useEffect(() => {
    // Generate high-resolution QR code pointing to https://begin-fin.com/
    QRCode.toDataURL('https://begin-fin.com/', {
      errorCorrectionLevel: 'M',
      margin: 1,
      scale: 12,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
      .then((url) => {
        setQrCodeUrl(url);
      })
      .catch((err) => {
        console.error('Error generating QR code:', err);
      });
  }, []);

  return (
    <main
      className="min-h-screen w-full flex flex-col items-center justify-center p-6 sm:p-10 md:p-14 select-none relative overflow-hidden bg-gradient-to-b from-[#EEF0FE] via-[#CCD0FD] to-[#9297F8]"
      style={{
        fontFamily: '"Source Sans 3", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Centered Slide Content Container */}
      <div className="w-full max-w-5xl flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
        
        {/* Dominant Headline: "Thank you." */}
        <h1 className="text-6xl min-[450px]:text-7xl sm:text-8xl md:text-9xl lg:text-[7.5rem] font-black text-black tracking-tight text-center leading-none mb-8 sm:mb-12 md:mb-14">
          Thank you.
        </h1>

        {/* Floating White Presentation Pill Card */}
        <a
          href="https://begin-fin.com/"
          target="_blank"
          rel="noopener noreferrer"
          title="Visit BeginFin at begin-fin.com"
          className="group bg-white rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.18)] hover:shadow-[0_25px_70px_-12px_rgba(0,0,0,0.24)] transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] p-6 sm:p-8 md:p-12 flex flex-row items-center gap-5 sm:gap-9 md:gap-12 cursor-pointer border border-white/60"
        >
          {/* QR Code Container */}
          <div className="shrink-0 bg-white p-1 sm:p-1.5 rounded-2xl flex items-center justify-center">
            <img
              src={qrCodeUrl}
              alt="Scan to visit https://begin-fin.com/"
              className="w-28 h-28 min-[420px]:w-36 min-[420px]:h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain block"
              loading="eager"
            />
          </div>

          {/* Text Labels Stacked Vertically */}
          <div className="flex flex-col justify-center text-left select-text">
            <span className="text-[#363A42] text-2xl min-[420px]:text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight leading-tight group-hover:text-black transition-colors">
              Explore BeginFin
            </span>
            <span className="text-[#656B77] text-lg min-[420px]:text-xl sm:text-2xl md:text-3xl lg:text-[2.35rem] font-normal sm:font-medium tracking-tight leading-tight mt-1 sm:mt-2">
              begin-fin.com
            </span>
          </div>
        </a>

      </div>
    </main>
  );
};
