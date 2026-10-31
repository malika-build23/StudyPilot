
import { useEffect, useRef } from 'react';

const ParticleNetwork = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let animationFrame;
    let particles = [];
    let width = 0;
    let height = 0;

    const isMobile = window.innerWidth < 640;
    const particleCount = isMobile ? 48 : 90;
    const connectionDistance = isMobile ? 145 : 175;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const brandColors = [
        { r: 45, g: 67, b: 84 },   // Slate Blue
        { r: 115, g: 118, b: 106 }, // Muted Olive
        { r: 254, g: 215, b: 165 }, // Soft Peach
        { r: 158, g: 103, b: 82 },  // Terracotta
        { r: 83, g: 65, b: 69 },    // Dusty Mauve
      ];

      particles = Array.from({ length: particleCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.8 + 1.2,
        alpha: Math.random() * 0.35 + 0.55,
        pulse: Math.random() * Math.PI * 2,
        color: brandColors[Math.floor(Math.random() * brandColors.length)],
      }));

      draw();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      // Draw connecting lines first so particles appear above them.
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];

        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j];
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const strength = 1 - distance / connectionDistance;
            const opacity = strength * 0.28;

            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(other.x, other.y);

            context.strokeStyle = `rgba(115, 118, 106, ${opacity})`;
            context.lineWidth = 0.7 + strength * 0.5;
            context.stroke();
          }
        }
      }

      // Draw glowing particles in brand colors.
      particles.forEach((particle) => {
        if (!reducedMotion) {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.pulse += 0.025;

          if (particle.x < 0 || particle.x > width) {
            particle.vx *= -1;
          }

          if (particle.y < 0 || particle.y > height) {
            particle.vy *= -1;
          }
        }

        const pulse = 0.85 + Math.sin(particle.pulse) * 0.15;
        const radius = particle.radius * pulse;
        const { r, g, b } = particle.color;

        // Outer glow
        context.beginPath();
        context.arc(
          particle.x,
          particle.y,
          radius * 3.2,
          0,
          Math.PI * 2
        );

        context.fillStyle = `rgba(${r}, ${g}, ${b}, ${particle.alpha * 0.18})`;
        context.fill();

        // Main particle
        context.beginPath();
        context.arc(
          particle.x,
          particle.y,
          radius,
          0,
          Math.PI * 2
        );

        context.fillStyle = `rgba(${r}, ${g}, ${b}, ${particle.alpha})`;
        context.fill();

        // Bright center
        context.beginPath();
        context.arc(
          particle.x,
          particle.y,
          radius * 0.35,
          0,
          Math.PI * 2
        );

        context.fillStyle = 'rgba(255, 255, 255, 0.85)';
        context.fill();
      });
    };

    const animate = () => {
      draw();
      animationFrame = window.requestAnimationFrame(animate);
    };

    resizeCanvas();

    if (!reducedMotion) {
      animationFrame = window.requestAnimationFrame(animate);
    }

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
};

export default ParticleNetwork;
