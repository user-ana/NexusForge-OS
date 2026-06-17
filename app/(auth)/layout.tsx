"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/lib/auth-context";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isRegister = pathname === "/register";

  return (
    <AuthProvider>
      <div className="min-h-screen flex items-center justify-center bg-nf-background p-4 sm:p-6 lg:p-8">
        {/* Centered card window with morphing transitions */}
        <div
          className="w-full max-w-4xl rounded-[24px] border border-nf-panel-border bg-nf-surface flex flex-col lg:flex-row overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.85)] relative auth-card-transition"
          style={{
            height: isRegister ? "780px" : "600px",
            minHeight: isRegister ? "740px" : "580px",
          }}
        >
          {/* ── Left Panel: Form Content (rendered as children) ── */}
          <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-between bg-nf-surface relative z-10 overflow-y-auto custom-scrollbar lg:h-full">
            {/* OS Window Dots */}
            <div className="absolute top-6 left-8 flex gap-1.5 z-20">
              <div className="w-2.5 h-2.5 rounded-full bg-white/[0.06]" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/[0.06]" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/[0.06]" />
            </div>

            {children}
          </div>

          {/* ── Right Panel: Cosmic Illustration ── */}
          <div className="hidden lg:flex lg:w-1/2 bg-[#090A0C] relative flex-col justify-between p-12 overflow-hidden border-l border-nf-panel-border/30">
            {/* Stars Background */}
            <div className="absolute inset-0 z-0">
              {[
                { top: "15%", left: "20%", size: "1.5px", delay: "0.2s" },
                { top: "35%", left: "80%", size: "2px", delay: "0.8s" },
                { top: "55%", left: "25%", size: "1.5px", delay: "1.4s" },
                { top: "60%", left: "70%", size: "2.5px", delay: "0.5s" },
                { top: "80%", left: "30%", size: "1px", delay: "1.9s" },
                { top: "20%", left: "60%", size: "2px", delay: "1.1s" },
                { top: "75%", left: "85%", size: "1.5px", delay: "0.3s" },
                { top: "10%", left: "45%", size: "2px", delay: "1.5s" },
                { top: "45%", left: "15%", size: "2.5px", delay: "0.1s" },
              ].map((star, i) => (
                <div
                  key={i}
                  className="absolute bg-white rounded-full opacity-60 animate-glow-pulse"
                  style={{
                    top: star.top,
                    left: star.left,
                    width: star.size,
                    height: star.size,
                    animationDelay: star.delay,
                    boxShadow: "0 0 6px rgba(255, 255, 255, 0.4)",
                  }}
                />
              ))}
            </div>

            {/* Shooting Stars / Meteor Shower (Diagonally flowing & Highly Visible) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              {[
                { top: "5%", left: "60%", duration: "4.5s", delay: "0s" },
                { top: "20%", left: "85%", duration: "5.5s", delay: "1.5s" },
                { top: "-10%", left: "50%", duration: "3.8s", delay: "3.0s" },
                { top: "35%", left: "95%", duration: "6.0s", delay: "4.5s" },
                { top: "15%", left: "70%", duration: "4.8s", delay: "2.2s" },
              ].map((meteor, i) => (
                <div
                  key={i}
                  className="meteor"
                  style={{
                    top: meteor.top,
                    left: meteor.left,
                    animation: `shooting-star ${meteor.duration} infinite linear`,
                    animationDelay: meteor.delay,
                  }}
                />
              ))}
            </div>

            {/* Planetary Orbit Elements Container */}
            <div className="relative flex-1 flex items-center justify-center z-10 font-sans">
              {/* Main Central Planet (Lavender/lilac 3D volumetric sphere) */}
              <div className="relative">
                <div
                  className="w-28 h-28 rounded-full bg-[radial-gradient(circle_at_30%_30%,#F3EFF7_0%,#D6C5F8_20%,#8E76C8_50%,#2F1B5C_80%,#090515_100%)] shadow-[0_0_50px_rgba(214,197,248,0.22),inset_-6px_-6px_20px_rgba(0,0,0,0.85)] animate-float"
                  style={{ animationDuration: "7s" }}
                />
                {/* Outer soft glow ring */}
                <div className="absolute inset-[-15px] border border-nf-primary/5 rounded-full filter blur-[2px] animate-glow-pulse pointer-events-none" />
              </div>

              {/* Small Planet - Top Right */}
              <div className="absolute top-[15%] right-[20%]">
                <div className="w-9 h-9 rounded-full bg-[radial-gradient(circle_at_30%_30%,#F3EFF7_0%,#98A6FF_25%,#3D4CA8_60%,#0D1136_90%,#02030D_100%)] shadow-[0_0_20px_rgba(152,166,255,0.15),inset_-3px_-3px_10px_rgba(0,0,0,0.85)]" />
              </div>

              {/* Foreground Meteor passing in front of the central planet */}
              <div
                className="meteor z-20"
                style={{
                  top: "30%",
                  left: "55%",
                  animation: "shooting-star 4.0s infinite linear",
                  animationDelay: "1.0s",
                }}
              />
            </div>

            {/* Minimalist Logo at the Bottom */}
            <div className="relative z-10 flex justify-center w-full select-none mt-auto">
              <span
                className="text-[17px] font-medium tracking-widest text-[#EBE8F4]/95 font-sans lowercase"
                style={{ letterSpacing: "0.2em" }}
              >
                nexus<span className="font-light opacity-60">forge</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
