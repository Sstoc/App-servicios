import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

export const Celebration = () => {
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef(null);
  const confettiRef = useRef(null);
  const messageRef = useRef(null);

  useEffect(() => {
    if (!isVisible) return;

    const ctx = gsap.context(() => {
      // 1. Animación del Mensaje Central
      gsap.fromTo(messageRef.current,
        { scale: 0, opacity: 0, rotation: -10 },
        { scale: 1, opacity: 1, rotation: 0, duration: 0.8, ease: "back.out(2)" }
      );

      // 2. Animación de Confeti (150 partículas - TODO DORADO)
      const pieces = confettiRef.current.querySelectorAll('.confetti');
      pieces.forEach((piece) => {
        gsap.set(piece, {
          x: gsap.utils.random(0, window.innerWidth),
          y: gsap.utils.random(-200, -50),
          rotation: gsap.utils.random(0, 360),
          backgroundColor: gsap.utils.random(['#fbbf24', '#f59e0b', '#d97706', '#fef3c7', '#fcd34d'])
        });

        gsap.to(piece, {
          y: window.innerHeight + 100,
          x: `+=${gsap.utils.random(-200, 200)}`,
          rotation: `+=${gsap.utils.random(360, 720)}`,
          duration: gsap.utils.random(2, 5),
          ease: "none",
          delay: gsap.utils.random(0, 2),
          repeat: 0
        });
      });

      // 3. Brillo en el texto
      gsap.to(messageRef.current, {
        filter: "drop-shadow(0 0 20px rgba(251, 191, 36, 0.8))",
        duration: 1.5,
        repeat: -1,
        yoyo: true
      });

      // 4. Auto-ocultado después de 4 segundos
      gsap.to(containerRef.current, {
        opacity: 0,
        delay: 3.5,
        duration: 0.5,
        onComplete: () => setIsVisible(false)
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
      {/* Background Dim */}
      <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]"></div>
      
      {/* Contenedor de Confeti */}
      <div ref={confettiRef} className="absolute inset-0">
        {[...Array(120)].map((_, i) => (
          <div 
            key={i} 
            className="confetti absolute w-2.5 h-2.5 rounded-sm shadow-sm"
          ></div>
        ))}
      </div>

      {/* Mensaje Central */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div ref={messageRef} className="text-center px-12 py-16 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/20">
          <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(250,204,21,0.6)] animate-bounce">
            <i className="fa-solid fa-crown text-5xl text-white"></i>
          </div>
          <h2 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-100 to-yellow-500 tracking-tighter drop-shadow-2xl">
            ¡TODO PAGADO!
          </h2>
        </div>
      </div>
    </div>
  );
};
