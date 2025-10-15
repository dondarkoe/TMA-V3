"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

function createBeam(width, height, baseHue, isGrayscale = false) {
    const angle = -30 + Math.random() * 20;
    return {
        x: Math.random() * width * 1.5 - width * 0.25,
        y: Math.random() * height * 1.5 - height * 0.25,
        width: 30 + Math.random() * 60,
        length: height * 2,
        angle: angle,
        speed: 0.7 + Math.random() * 0.8,
        opacity: 0.15 + Math.random() * 0.2,
        hue: isGrayscale ? 0 : (baseHue - 20 + Math.random() * 40),
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        isGrayscale: isGrayscale
    };
}

export function BeamsBackground({
    className,
    baseHue = 220, // Default to blue-ish hue
    grayscale = false // NEW: Grayscale mode
}) {
    const canvasRef = useRef(null);
    const beamsRef = useRef([]);
    const animationFrameRef = useRef(0);
    const MINIMUM_BEAMS = 25;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const updateCanvasSize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
            ctx.scale(dpr, dpr);

            const totalBeams = MINIMUM_BEAMS;
            beamsRef.current = Array.from({ length: totalBeams }, () =>
                createBeam(canvas.width / dpr, canvas.height / dpr, baseHue, grayscale)
            );
        };

        updateCanvasSize();
        window.addEventListener("resize", updateCanvasSize);

        function resetBeam(beam, index, totalBeams) {
            if (!canvas) return beam;
            
            const rect = canvas.getBoundingClientRect();
            const column = index % 3;
            const spacing = rect.width / 3;

            beam.y = rect.height + 100;
            beam.x =
                column * spacing +
                spacing / 2 +
                (Math.random() - 0.5) * spacing * 0.5;
            beam.width = 100 + Math.random() * 100;
            beam.speed = 0.5 + Math.random() * 0.4;
            beam.hue = grayscale ? 0 : (baseHue - 20 + (index * 40) / totalBeams);
            beam.opacity = 0.2 + Math.random() * 0.1;
            beam.isGrayscale = grayscale;
            return beam;
        }

        function drawBeam(ctx, beam) {
            ctx.save();
            ctx.translate(beam.x, beam.y);
            ctx.rotate((beam.angle * Math.PI) / 180);

            const pulsingOpacity =
                beam.opacity * (0.8 + Math.sin(beam.pulse) * 0.2);

            const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);

            // Use grayscale or colored gradient based on beam properties
            const saturation = beam.isGrayscale ? '0%' : '85%';
            const lightness = beam.isGrayscale ? '50%' : '65%';

            gradient.addColorStop(0, `hsla(${beam.hue}, ${saturation}, ${lightness}, 0)`);
            gradient.addColorStop(0.1, `hsla(${beam.hue}, ${saturation}, ${lightness}, ${pulsingOpacity * 0.5})`);
            gradient.addColorStop(0.4, `hsla(${beam.hue}, ${saturation}, ${lightness}, ${pulsingOpacity})`);
            gradient.addColorStop(0.6, `hsla(${beam.hue}, ${saturation}, ${lightness}, ${pulsingOpacity})`);
            gradient.addColorStop(0.9, `hsla(${beam.hue}, ${saturation}, ${lightness}, ${pulsingOpacity * 0.5})`);
            gradient.addColorStop(1, `hsla(${beam.hue}, ${saturation}, ${lightness}, 0)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
            ctx.restore();
        }

        let lastTime = 0;
        function animate(timestamp) {
            if (!canvas || !ctx) return;
            const deltaTime = timestamp - lastTime;
            lastTime = timestamp;

            const rect = canvas.getBoundingClientRect();
            ctx.clearRect(0, 0, rect.width, rect.height);

            const totalBeams = beamsRef.current.length;
            beamsRef.current.forEach((beam, index) => {
                beam.y -= beam.speed * (deltaTime / 16); // Adjust speed for frame rate
                beam.pulse += beam.pulseSpeed * (deltaTime / 16);

                if (beam.y + beam.length < -100) {
                    resetBeam(beam, index, totalBeams);
                }

                drawBeam(ctx, beam);
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        }

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("resize", updateCanvasSize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [baseHue, grayscale]);

    return (
        <canvas
            ref={canvasRef}
            className={cn("absolute inset-0 w-full h-full", className)}
        />
    );
}