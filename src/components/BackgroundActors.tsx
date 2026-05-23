import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

const ACTORS = [
  { id: 1, name: "The Icon", image: "https://i.pinimg.com/736x/83/b7/8e/83b78eb323d12c8728587229bdd3cecd.jpg", x: '5%', y: '120vh', rotate: -12, rotateY: 15, rotateX: 10, z: -800 },
  { id: 2, name: "Ramp Queen", image: "https://i.pinimg.com/736x/2f/3b/a9/2f3ba94ca95d7675fca4dc75213ecaf8.jpg", x: '75%', y: '220vh', rotate: 8, rotateY: -20, rotateX: -15, z: -600 },
  { id: 3, name: "Style Guru", image: "https://i.pinimg.com/736x/77/2e/97/772e978ca2dc66a15386828e245f4cba.jpg", x: '12%', y: '320vh', rotate: 5, rotateY: 10, rotateX: 20, z: -900 },
  { id: 4, name: "Fashion Editor", image: "https://i.pinimg.com/736x/81/1f/4f/811f4f7dd99f8f6da90a2cd45c044ba4.jpg", x: '82%', y: '420vh', rotate: -15, rotateY: -25, rotateX: -5, z: -400 },
  { id: 5, name: "Neon Muse", image: "https://i.pinimg.com/736x/91/4e/5c/914e5ce81a91641e98b32a9fedc10b61.jpg", x: '45%', y: '520vh', rotate: 0, rotateY: 30, rotateX: 15, z: -1000 },
  { id: 6, name: "Gold Aura", image: "https://i.pinimg.com/736x/0e/cb/8f/0ecb8f55928b79272ec4f96809c594d0.jpg", x: '8%', y: '620vh', rotate: 12, rotateY: -15, rotateX: -20, z: -700 },
  { id: 7, name: "Vogue Noir", image: "https://i.pinimg.com/736x/a0/48/74/a0487433b4ebdf1cce006bbae18dfd76.jpg", x: '65%', y: '720vh', rotate: -8, rotateY: 20, rotateX: 10, z: -850 },
  { id: 8, name: "Silk Master", image: "https://i.pinimg.com/736x/5f/da/94/5fda94b82b9329f84d918f07cb9fa2b8.jpg", x: '15%', y: '820vh', rotate: 15, rotateY: -10, rotateX: -10, z: -500 },
  { id: 9, name: "Cyber Chic", image: "https://i.pinimg.com/736x/ae/90/f5/ae90f5ed75ec750890911876faf7bfdb.jpg", x: '78%', y: '920vh', rotate: -5, rotateY: 25, rotateX: 25, z: -950 },
  { id: 10, name: "Ethereal Ramp", image: "https://i.pinimg.com/736x/4d/7a/a8/4d7aa84e365046271c7b508f7ce0e4b7.jpg", x: '35%', y: '1020vh', rotate: 20, rotateY: -30, rotateX: -15, z: -750 },
];

export default function BackgroundActors() {
  const { scrollYProgress } = useScroll();

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden [perspective:2000px]">
      {/* 3D Depth Grid Backdrop */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #D4AF37 1px, transparent 1px),
            linear-gradient(to bottom, #D4AF37 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          transform: 'rotateX(60deg) translateY(-20%) translateZ(-500px)',
          transformOrigin: 'top'
        }}
      />

      {ACTORS.map((actor, i) => {
        return (
          <ActorPortrait key={actor.id} actor={actor} scrollYProgress={scrollYProgress} index={i} />
        );
      })}
    </div>
  );
}

function ActorPortrait({ actor, scrollYProgress, index }: { actor: any, scrollYProgress: any, index: number }) {
  // Enhanced scroll range for more density
  const scrollStart = (index * 0.08); 
  const scrollEnd = scrollStart + 0.15;

  const y = useTransform(scrollYProgress, [0, 1], [0, -3500]);
  
  // Opacity: Fade in and out sharply
  const opacity = useTransform(scrollYProgress, 
    [scrollStart, scrollStart + 0.05, scrollStart + 0.1, scrollEnd], 
    [0, 0.6, 0.6, 0]
  );

  // Scale & Z: The "Pop Up" effect
  const scale = useTransform(scrollYProgress, 
    [scrollStart, scrollStart + 0.1], 
    [0.5, 1.8]
  );
  
  const z = useTransform(scrollYProgress,
    [scrollStart, scrollStart + 0.12],
    [actor.z, 600]
  );
  
  const rotateY = useTransform(scrollYProgress,
    [scrollStart, scrollStart + 0.1],
    [actor.rotateY * 5, -actor.rotateY]
  );

  const rotateX = useTransform(scrollYProgress,
    [scrollStart, scrollStart + 0.1],
    [actor.rotateX * 3, 0]
  );

  const zIndex = useTransform(scrollYProgress,
    [scrollStart, scrollStart + 0.1],
    [0, 500]
  );

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: actor.y,
        left: actor.x,
        y: y,
        z: z,
        opacity: opacity,
        scale: scale,
        rotate: actor.rotate,
        rotateY: rotateY,
        rotateX: rotateX,
        zIndex: zIndex,
        transformStyle: "preserve-3d",
        willChange: "transform, opacity"
      }}
      className="w-64 md:w-96 aspect-[2/3] contrast-[1.1] saturate-[1.2] group"
    >
      <div className="relative w-full h-full overflow-hidden rounded-sm border border-shakti-gold/20 shadow-[0_0_120px_rgba(212,175,55,0.15)]">
        <img 
          src={actor.image} 
          alt={actor.name} 
          className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-shakti-black via-transparent to-shakti-gold/5" />
        
        {/* Animated Gradient Accents */}
        <motion.div 
          animate={{ 
            opacity: [0.1, 0.3, 0.1],
            background: [
              'linear-gradient(45deg, transparent, rgba(224,17,95,0.1), transparent)',
              'linear-gradient(45deg, transparent, rgba(212,175,55,0.1), transparent)'
            ]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 pointer-events-none" 
        />
        
        {/* Luxury Dual-Tone Frame Overlay */}
        <div className="absolute inset-4 border border-shakti-gold/40 pointer-events-none" />
        <div className="absolute inset-[18px] border-[1px] border-lotus-pink/20 pointer-events-none" />
        <div className="absolute inset-0 border-[20px] border-shakti-black/40 pointer-events-none" />
        
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-shakti-gold" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-lotus-pink" />
      </div>
      
      <div className="mt-8 text-center [transform-style:preserve-3d]">
        <motion.span 
          style={{ 
            rotateY: useTransform(rotateY, [actor.rotateY * 4, -actor.rotateY], [30, -30]),
            z: 80 
          }}
          className="block text-[16px] uppercase tracking-[1.5em] gold-text font-black drop-shadow-[0_0_30px_rgba(212,175,55,0.5)] italic"
        >
          {actor.name}
        </motion.span>
        <div className="h-[1px] w-24 mx-auto mt-3 bg-gradient-to-r from-transparent via-lotus-pink/50 to-transparent" />
      </div>
    </motion.div>
  );
}
