import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';

const WORDS = "Where Fashion Meets Digital Royalty".split(' ');

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<'bloom' | 'complete'>('bloom');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // --- AUDIO SYNTHESIS FOR MOVIE OPENING EFFECT ---
  const playCinematicSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const master = ctx.createGain();
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.5);
      master.connect(ctx.destination);

      // Deep, low frequency cinematic resonance thrum (Indian mythological vibe)
      const droneOsc = ctx.createOscillator();
      const droneFilter = ctx.createBiquadFilter();
      const droneGain = ctx.createGain();

      droneOsc.type = 'sawtooth';
      droneOsc.frequency.setValueAtTime(45, ctx.currentTime); // Low F# resonance

      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(110, ctx.currentTime);
      droneFilter.Q.setValueAtTime(3.0, ctx.currentTime);

      droneGain.gain.setValueAtTime(0.5, ctx.currentTime);
      droneGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.5);

      droneOsc.connect(droneFilter);
      droneFilter.connect(droneGain);
      droneGain.connect(master);
      droneOsc.start();
      droneOsc.stop(ctx.currentTime + 3.8);

      // Celestial high frequency wind/chime as the lotus blooms
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(440, ctx.currentTime);
      chimeOsc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 2.0);

      chimeGain.gain.setValueAtTime(0, ctx.currentTime);
      chimeGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 1.2);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.8);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(master);
      chimeOsc.start();
      chimeOsc.stop(ctx.currentTime + 3.0);

      // Sweeping whoosh transition at 3.0s
      setTimeout(() => {
        try {
          const oscSweep = ctx.createOscillator();
          const sweepGain = ctx.createGain();
          oscSweep.type = 'sine';
          oscSweep.frequency.setValueAtTime(120, ctx.currentTime);
          oscSweep.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.8);

          sweepGain.gain.setValueAtTime(0, ctx.currentTime);
          sweepGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.3);
          sweepGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);

          oscSweep.connect(sweepGain);
          sweepGain.connect(master);
          oscSweep.start();
          oscSweep.stop(ctx.currentTime + 1.0);
        } catch (_) {}
      }, 2600);

    } catch (e) {
      console.debug("Audio initiation delayed by gesture restriction.");
    }
  };

  // Attempt sound on first user activity
  useEffect(() => {
    const handleGesture = () => {
      if (!audioCtxRef.current) {
        playCinematicSound();
      } else if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    };
    window.addEventListener('click', handleGesture);
    window.addEventListener('touchstart', handleGesture);
    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
    };
  }, []);

  // --- AUTOMATED 3.8 SECOND LIFECYCLE ---
  useEffect(() => {
    // Play sound immediately on initiation
    playCinematicSound();

    const completeTimer = setTimeout(() => {
      // Smooth fade out master gain if context is active
      if (audioCtxRef.current) {
        try {
          const ctx = audioCtxRef.current;
          ctx.close();
        } catch (_) {}
      }
      onComplete();
    }, 3800); // Exquisite 3.8s total cinematic cinematic presentation

    return () => clearTimeout(completeTimer);
  }, [onComplete]);

  // --- 3D CANVAS LOTUS RENDERER ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = 120);
    let height = (canvas.height = 120);

    // Dynamic scale listener for clean responsive resolution
    const resize = () => {
      if (canvas) {
        width = canvas.width = 120;
        height = canvas.height = 120;
      }
    };
    window.addEventListener('resize', resize);

    // Cinematic Lotus blooming configuration
    let bloomProgress = 0.0; // starts at tight bud (0) and expands to gorgeous full open (1)
    const bloomSpeed = 0.012; // synchronized over the opening runway duration

    // Particle trace array for celestial dust coming off the blooming divine lotus
    const particles: Array<{ x: number; y: number; vx: number; vy: number; alpha: number; size: number }> = [];

    const drawPetal3D = (
      centerX: number,
      centerY: number,
      angle: number,
      length: number,
      tiltY: number, // 3D projection tilt simulation
      thickness: number,
      colorStart: string,
      colorEnd: string
    ) => {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);

      // Create shimmering metallic lighting gradient along the curved outer petal
      const grad = ctx.createLinearGradient(0, 0, 0, -length);
      grad.addColorStop(0.0, colorStart);
      grad.addColorStop(0.7, colorEnd);
      grad.addColorStop(1.0, '#ffffff'); // bright reflective tipping point

      ctx.fillStyle = grad;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#d4af37';

      // 3D projected petal coordinates
      ctx.beginPath();
      ctx.moveTo(0, 0);
      
      // Left curve of the petal with 3D projection factor (tiltY)
      ctx.bezierCurveTo(
        -thickness * tiltY, 
        -length * 0.3, 
        -thickness * 0.4 * tiltY, 
        -length * 0.9, 
        0, 
        -length
      );

      // Right curve of the petal
      ctx.bezierCurveTo(
        thickness * 0.4 * tiltY, 
        -length * 0.9, 
        thickness * tiltY, 
        -length * 0.3, 
        0, 
        0
      );

      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const runRenderLoop = () => {
      ctx.clearRect(0, 0, width, height);

      // Slowly increment bloom state
      if (bloomProgress < 1.0) {
        bloomProgress += bloomSpeed;
      }

      const cx = width / 2;
      const cy = height * 0.72;

      // Draw beautiful lotus root stem with subtle golden outline
      const stemGrad = ctx.createLinearGradient(cx - 3, cy, cx + 3, height);
      stemGrad.addColorStop(0, '#0c050a');
      stemGrad.addColorStop(1, '#D4AF37');
      ctx.fillStyle = stemGrad;
      ctx.fillRect(cx - 2, cy - 2, 4, height - cy + 2);

      // Render ambient soft glow behind the lotus flower
      const aura = ctx.createRadialGradient(cx, cy - 20, 2, cx, cy - 20, 45);
      aura.addColorStop(0, `rgba(224, 17, 95, ${0.45 * bloomProgress})`); // Royal Lotus Pink core
      aura.addColorStop(0.5, `rgba(212, 175, 55, ${0.28 * bloomProgress})`); // Gold crown glow
      aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(cx, cy - 20, 45, 0, Math.PI * 2);
      ctx.fill();

      // 1. OUTER RING (8 petals) - Opens first and widest
      const outerCount = 8;
      const outerMaxAngle = Math.PI * 0.32; // wide open
      const outerAngle = outerMaxAngle * Math.min(1, bloomProgress * 1.25);
      const outerLength = 32 * Math.min(1.0, 0.4 + bloomProgress * 0.6);

      for (let i = 0; i < outerCount; i++) {
        const stepAngle = (Math.PI * 2 * i) / outerCount;
        // Project onto simulated 3D elliptic camera tilt
        const px = Math.cos(stepAngle) * outerAngle;
        const py = Math.sin(stepAngle) * outerAngle * 0.4;
        const ptilt = 0.6 + Math.sin(stepAngle) * 0.4;

        drawPetal3D(
          cx + px * 22,
          cy + py * 10 - 5,
          stepAngle + Math.PI / 2,
          outerLength,
          ptilt,
          10,
          '#600520', // deep ruby red base
          '#E0115F'  // beautiful lotus pink tips
        );
      }

      // 2. INNER RING (6 petals) - Opens slightly slower
      const innerCount = 6;
      const innerMaxAngle = Math.PI * 0.16;
      const innerAngle = innerMaxAngle * Math.max(0, (bloomProgress - 0.25) * 1.25);
      const innerLength = 26 * Math.min(1.0, 0.3 + bloomProgress * 0.7);

      if (bloomProgress > 0.15) {
        for (let i = 0; i < innerCount; i++) {
          const stepAngle = (Math.PI * 2 * i) / innerCount + Math.PI / 6;
          const px = Math.cos(stepAngle) * innerAngle;
          const py = Math.sin(stepAngle) * innerAngle * 0.35;
          const ptilt = 0.5 + Math.sin(stepAngle) * 0.3;

          drawPetal3D(
            cx + px * 14,
            cy + py * 6 - 8,
            stepAngle + Math.PI / 2,
            innerLength,
            ptilt,
            7.5,
            '#e0115f',
            '#D4AF37' // gold crowning highlight tips
          );
        }
      }

      // 3. SACRED THE GOLDEN CORE BUD STAMEN
      const coreSize = 6 * Math.min(1.0, bloomProgress * 1.1);
      const coreGrad = ctx.createRadialGradient(cx, cy - 10, 1, cx, cy - 10, coreSize + 2);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.4, '#F9E79F');
      coreGrad.addColorStop(1, '#9A7B1D');

      ctx.fillStyle = coreGrad;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#D4AF37';
      ctx.beginPath();
      ctx.arc(cx, cy - 12 * Math.min(1.0, bloomProgress), coreSize, 0, Math.PI * 2);
      ctx.fill();

      // Emit soft shimmering gold dust sparks from blooming flower core
      if (Math.random() < 0.25 && bloomProgress > 0.3) {
        particles.push({
          x: cx + (Math.random() - 0.5) * 15,
          y: cy - 10,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -Math.random() * 1.2 - 0.5,
          alpha: 1.0,
          size: Math.random() * 1.8 + 0.8
        });
      }

      // Render and update custom celestial particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.015;
        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#D4AF37';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(runRenderLoop);
    };

    runRenderLoop();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Split logo into logical elements to pinpoint the "i" stem.
  // "S-H-A-K-T-i-Y-U-G" has 9 letters total.
  // Sub-group A: "Shakt"
  // Pillar letter: "i" (replaced with golden stem + blooming 3D lotus capsule)
  // Sub-group B: "yug"
  const wordGroupA = ["S", "h", "a", "k", "t"];
  const wordGroupB = ["y", "u", "g"];

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[200] bg-[#050204] flex flex-col items-center justify-center overflow-hidden w-full h-full select-none"
    >
      {/* EXQUISITE HIGH-BUDGET DUST PARTICLES & SPOTLIGHT BEAMS BACKSTAGE */}
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f050b]/40 to-[#050204] pointer-events-none z-1" />
      
      {/* Divine soft light shaft behind the centerpiece */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-b from-shakti-gold/15 to-transparent blur-[120px] pointer-events-none animate-pulse duration-[5000ms]" />

      {/* Floating stardust field */}
      <div className="absolute inset-0 pointer-events-none opacity-25 z-0">
        {[...Array(24)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight + 100,
              opacity: Math.random() * 0.4 + 0.1,
              scale: Math.random() * 0.8 + 0.5 
            }}
            animate={{ 
              y: [null, -110], 
              opacity: [null, 0] 
            }}
            transition={{ 
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 1.5 
            }}
            className="absolute w-1 h-1 bg-shakti-gold rounded-full blur-[0.5px]"
          />
        ))}
      </div>

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(30px)', scale: 1.05 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          className="flex flex-col items-center justify-center text-center p-6 z-20 w-full"
        >
          {/* Logo container aligning letters and canvas meticulously */}
          <div className="flex items-end justify-center tracking-[0.05em] relative select-none">
            {/* 1. First block of letters: Shakt */}
            <div className="flex">
              {wordGroupA.map((letter, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 15, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ 
                    duration: 1.2, 
                    delay: index * 0.08, 
                    ease: [0.215, 0.61, 0.355, 1] 
                  }}
                  className="font-serif text-5xl md:text-7xl font-black uppercase italic gold-text flex items-end h-20 md:h-28"
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            {/* 2. THE LETTER "I" WITH INTEGRATED BLOOMING 3D LOTUS CAP */}
            <div className="relative flex flex-col items-center justify-end w-14 md:w-20 h-28 md:h-40 -mx-1 md:-mx-2 select-none">
              {/* Dynamic 3D Lotus Canvas precisely replacing the "i" dot */}
              <motion.div
                initial={{ opacity: 0, scale: 0.01, y: 22 }}
                animate={{ opacity: 1, scale: 1.05, y: 0 }}
                transition={{ 
                  duration: 1.6, 
                  delay: 0.4, 
                  ease: [0.175, 0.885, 0.32, 1.1] 
                }}
                className="absolute top-[-25px] md:top-[-35px]"
              >
                <div className="relative">
                  {/* Subtle divine golden backflare shadow */}
                  <div className="absolute inset-0 bg-shakti-gold/25 rounded-full blur shadow-[0_0_24px_rgba(212,175,55,0.45)] animate-pulse duration-[2000ms]" />
                  <canvas 
                    ref={canvasRef} 
                    className="relative w-[110px] h-[110px] md:w-[130px] md:h-[130px] z-20"
                  />
                </div>
              </motion.div>

              {/* Styled stem pillar acting as the "i" vertical body */}
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ duration: 1.1, delay: 0.1, ease: 'easeOut' }}
                className="w-2.5 md:w-3.5 h-[50px] md:h-[68px] origin-bottom rounded-t-sm relative flex items-end justify-center overflow-hidden"
                style={{
                  background: 'linear-gradient(to top, #9A7B1D, #D4AF37, #F9E79F)'
                }}
              >
                {/* Internal metallic shimmer highlight animation */}
                <motion.div
                  animate={{ y: ['-100%', '200%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-[1px] bg-white/20 blur-[0.5px]"
                />
              </motion.div>
            </div>

            {/* 3. Second block of letters: yug */}
            <div className="flex">
              {wordGroupB.map((letter, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 15, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ 
                    duration: 1.2, 
                    delay: 0.5 + index * 0.08, 
                    ease: [0.215, 0.61, 0.355, 1] 
                  }}
                  className="font-serif text-5xl md:text-7xl font-black uppercase italic gold-text flex items-end h-20 md:h-28"
                >
                  {letter}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Underlay subtitle / foundation metadata of royal lineage */}
          <motion.p
            initial={{ opacity: 0, letterSpacing: '0.15em' }}
            animate={{ opacity: 0.8, letterSpacing: '0.5em' }}
            transition={{ duration: 1.5, delay: 0.8, ease: 'easeOut' }}
            className="text-[8px] md:text-[9.5px] uppercase tracking-[0.5em] text-shakti-gold/80 font-black mt-4 max-w-sm"
          >
            Couture Collective • Est 2026
          </motion.p>

          <div className="h-[1px] bg-gradient-to-r from-transparent via-shakti-gold/30 to-transparent w-44 my-8" />

          {/* Dynamic Staggered Royal Fashion Slogan */}
          <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 max-w-xl px-4">
            {WORDS.map((w, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{
                  duration: 0.9,
                  delay: 1.5 + idx * 0.08,
                  ease: 'easeOut'
                }}
                className="font-serif italic text-xl md:text-2xl text-white font-light tracking-wide text-center"
              >
                {w}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
