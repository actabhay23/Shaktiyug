/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import SplashScreen from './components/SplashScreen';
import Navbar from './components/Navbar';
import ShaktiyugLogo from './components/ShaktiyugLogo';
import BackgroundEffect from './components/BackgroundEffect';
import BackgroundActors from './components/BackgroundActors';
import CastingBoard from './components/CastingBoard';
import FashionHub from './components/FashionHub';
import BackstageRoom from './components/BackstageRoom';
import ProfileDashboard from './components/ProfileDashboard';
import Lotus3DTransition from './components/Lotus3DTransition';
import AIChatbot from './components/AIChatbot';
import FeedbackModal from './components/FeedbackModal';
import LiveExperience from './components/LiveExperience';
import BackstageAdmin from './components/BackstageAdmin';
import AbhayCredit from './components/AbhayCredit';
import GlobalLotusClicks from './components/GlobalLotusClicks';
import VogueLoginModal from './components/VogueLoginModal';

const UNIVERSE_NAMES: Record<string, string> = {
  casting: 'Casting Board',
  dashboard: 'Fashion Hub',
  screening: 'Backstage Room',
  profile: 'Profile Dashboard',
  live: 'Live Experience',
  admin: 'Backstage Control'
};

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeNav, setActiveNav] = useState('casting');
  const [pendingNav, setPendingNav] = useState('casting');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const lastNavTime = useRef<number>(0);

  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('shakti_vogue_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showVogueLoginModal, setShowVogueLoginModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('shakti_vogue_user');
    setCurrentUser(null);
    window.dispatchEvent(new Event('vogue-auth-change'));
  };

  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('shakti_vogue_user');
      setCurrentUser(saved ? JSON.parse(saved) : null);
    };
    window.addEventListener('vogue-auth-change', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('vogue-auth-change', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const [isLiveGlobally, setIsLiveGlobally] = useState(false);
  const [liveTitle, setLiveTitle] = useState('');
  const [showLivePopup, setShowLivePopup] = useState(false);
  const [hasDismissedPopup, setHasDismissedPopup] = useState(false);

  useEffect(() => {
    if (showSplash) return;
    
    const checkLiveStream = async () => {
      try {
        const res = await fetch('/api/owner/live');
        if (res.ok) {
          const stream = await res.json();
          if (stream.isLive) {
            setLiveTitle(stream.title);
            if (!isLiveGlobally && !hasDismissedPopup) {
              setShowLivePopup(true);
            }
            setIsLiveGlobally(true);
          } else {
            setIsLiveGlobally(false);
            setShowLivePopup(false);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    checkLiveStream();
    const interval = setInterval(checkLiveStream, 8000);
    return () => clearInterval(interval);
  }, [showSplash, isLiveGlobally, hasDismissedPopup]);

  const handleNavChange = (target: string) => {
    const now = Date.now();
    if (now - lastNavTime.current < 1500) return; // Throttle multiple clicks to avoid overlap/double triggers
    if (target === activeNav || isTransitioning) return;
    lastNavTime.current = now;
    setPendingNav(target);
    setIsTransitioning(true);
  };

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden selection:bg-shakti-gold selection:text-shakti-black">
      <AnimatePresence>
        {showSplash ? (
          <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
        ) : (
          <motion.main 
            ref={mainRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <BackgroundEffect />
            <BackgroundActors />
            <Navbar 
              active={activeNav} 
              setActive={handleNavChange} 
              currentUser={currentUser}
              onLogout={handleLogout}
              onOpenLogin={() => setShowVogueLoginModal(true)}
            />

            {/* 3D Cinematic Lotus Transition Overlay */}
            {isTransitioning && (
              <Lotus3DTransition
                destinationName={UNIVERSE_NAMES[pendingNav] || 'New Dimension'}
                onBloomComplete={() => {
                  // Switch the active universe/tab behind the blooming flash veil
                  setActiveNav(pendingNav);
                }}
                onTransitionEnd={() => {
                  // Transition has fully completed and faded out
                  setIsTransitioning(false);
                }}
              />
            )}
            
            {/* Immersive glassmorphic dashboard universe container */}
            <div className="relative min-h-screen">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeNav}
                  initial={{ 
                    opacity: 0, 
                    scale: 0.96, 
                    rotateX: 8,
                    z: -120,
                  }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    rotateX: 0,
                    z: 0,
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 1.04, 
                    rotateX: -8,
                    z: 120,
                  }}
                  transition={{ 
                    duration: 0.8, 
                    ease: [0.16, 1, 0.3, 1] 
                  }}
                  style={{ 
                    transformStyle: 'preserve-3d', 
                    perspective: '1200px',
                    willChange: 'transform, opacity'
                  }}
                >
                  {activeNav === 'casting' && <CastingBoard />}
                  {activeNav === 'dashboard' && <FashionHub />}
                  {activeNav === 'screening' && <BackstageRoom />}
                  {activeNav === 'profile' && (
                    <ProfileDashboard 
                      currentUser={currentUser} 
                      onOpenLogin={() => setShowVogueLoginModal(true)} 
                    />
                  )}
                  {activeNav === 'live' && <LiveExperience />}
                  {activeNav === 'admin' && <BackstageAdmin />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Global LIVE Broadcast Popup Notification & Sticky Banner */}
            <AnimatePresence>
              {isLiveGlobally && activeNav !== 'live' && (
                <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-auto">
                  {showLivePopup && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 50 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 30 }}
                      className="bg-[#0c050a]/95 border border-lotus-pink/30 p-4 rounded-sm shadow-2xl relative overflow-hidden backdrop-blur-3xl"
                    >
                      <button
                        onClick={() => {
                          setShowLivePopup(false);
                          setHasDismissedPopup(true);
                        }}
                        className="absolute top-2.5 right-2.5 text-white/35 hover:text-white text-xs select-none cursor-pointer"
                      >
                        ✕
                      </button>
                      
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-600/15 border border-red-500/20 flex items-center justify-center text-red-500 animate-pulse shrink-0 mt-0.5">
                          ❤️
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] uppercase font-mono tracking-widest text-red-400 font-bold block">
                            LIVE TRANSMISSION ALERT
                          </span>
                          <h6 className="font-bold text-xs text-white leading-snug font-serif italic">
                            {liveTitle || 'Shaktiyug Revelation Showcase'} is now live!
                          </h6>
                          <button
                            onClick={() => {
                              handleNavChange('live');
                              setShowLivePopup(false);
                              setHasDismissedPopup(true);
                            }}
                            className="text-[9px] uppercase tracking-wider text-shakti-gold hover:text-shakti-gold-light mt-1 font-bold block transition-all cursor-pointer text-left"
                          >
                            Step to Stage Client →
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Tiny ongoing floating live now beacon */}
                  <motion.button
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    onClick={() => handleNavChange('live')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg hover:shadow-red-500/10 border border-red-100/20 active:scale-95 transition-all cursor-pointer font-sans font-black text-[9px] uppercase tracking-widest self-end"
                  >
                    <span className="h-2 w-2 relative flex shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    <span>LIVE NOW</span>
                  </motion.button>
                </div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <footer className="py-20 px-6 border-t border-white/5 bg-shakti-black/90 backdrop-blur-3xl">
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
                  <div className="space-y-8">
                    <ShaktiyugLogo />
                    <p className="text-white/40 text-sm leading-relaxed max-w-xs font-light">
                      The dawn of a new era in fashion collaboration. Step onto the ramp of transformation.
                    </p>
                    <div className="pt-4 space-y-2">
                       <p className="text-[10px] uppercase tracking-[0.5em] text-shakti-gold font-black">CURATED BY</p>
                       <p className="text-[11px] uppercase tracking-[0.3em] text-white/60 font-bold">AMAN • AKASH • MAHI</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <h6 className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-black">Directory</h6>
                      <ul className="space-y-3 text-[10px] uppercase tracking-[0.2em] font-bold text-white/60">
                        <li><a href="#" className="hover:text-shakti-gold transition-colors">Manifesto</a></li>
                        <li><a href="#" className="hover:text-shakti-gold transition-colors">Designers</a></li>
                        <li><a href="#" className="hover:text-shakti-gold transition-colors">Agencies</a></li>
                      </ul>
                    </div>
                    <div className="space-y-6">
                      <h6 className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-black">Luxe Care</h6>
                      <ul className="space-y-3 text-[10px] uppercase tracking-[0.2em] font-bold text-white/60">
                        <li><a href="#" className="hover:text-shakti-gold transition-colors">Style Support</a></li>
                        <li><a href="#" className="hover:text-shakti-gold transition-colors">VIP Access</a></li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-8">
                    <h6 className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-black">The Vogue Letter</h6>
                    <div className="relative">
                      <input 
                        type="email" 
                        placeholder="STYLE@SHAKTIYUG.COM" 
                        className="input-fashion border-shakti-gold/30 focus:border-shakti-gold"
                      />
                      <button className="absolute right-0 bottom-3 text-shakti-gold text-[10px] uppercase tracking-[0.5em] font-black group">
                        SUBSCRIBE <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                  <p className="text-[9px] uppercase tracking-[0.6em] text-white/10 font-bold italic">© 2026 Shaktiyug Collective • Collaborative Aura</p>
                  <AbhayCredit />
                  <div className="flex gap-8 text-[9px] uppercase tracking-[0.4em] text-white/20 font-bold">
                    <a href="#" className="hover:text-white transition-colors">TIKTOK</a>
                    <a href="https://www.instagram.com/the.shaktiyug?igsh=MTQycnI4NHFhdG1tcg==" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">INSTAGRAM</a>
                    <a href="#" className="hover:text-white transition-colors">BEHANCE</a>
                  </div>
                </div>
              </footer>
              {/* Global Couture Tools */}
              <AIChatbot />
              <FeedbackModal />
              <GlobalLotusClicks />
              <VogueLoginModal 
                isOpen={showVogueLoginModal}
                onClose={() => setShowVogueLoginModal(false)}
                onLoginSuccess={(userData) => {
                  localStorage.setItem('shakti_vogue_user', JSON.stringify(userData));
                  setCurrentUser(userData);
                  window.dispatchEvent(new Event('vogue-auth-change'));
                }}
              />
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}

