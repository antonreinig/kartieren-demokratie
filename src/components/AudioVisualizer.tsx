'use client';

import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
    stream: MediaStream;
}

export default function AudioVisualizer({ stream }: AudioVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const blocksRef = useRef<number[]>([]);
    const lastUpdateRef = useRef<number>(0);
    const currentMaxAmplitudeRef = useRef<number>(0);

    const BAR_WIDTH = 2;
    const GAP = 1;
    const STRIDE = BAR_WIDTH + GAP;
    const UPDATE_INTERVAL = 100; // 100ms per block

    useEffect(() => {
        if (!canvasRef.current || !stream) return;

        const container = canvasRef.current.parentElement;
        if (!container) return;

        // --- High DPI Setup ---
        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();

        // Set display size (css properties)
        canvasRef.current.style.width = `${rect.width}px`;
        canvasRef.current.style.height = `${rect.height}px`;

        // Set actual size in memory
        canvasRef.current.width = rect.width * dpr;
        canvasRef.current.height = rect.height * dpr;

        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return;

        // Scale all drawing operations by dpr
        // But since we control pixels manually, we might handle scaling explicitly or use scaling matrix.
        // Let's use scale() so logic remains logical (1 unit = 1 CSS pixel)
        canvasCtx.scale(dpr, dpr);

        // Audio Setup
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);

        source.connect(analyser);
        analyser.fftSize = 256;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // Fill logic based on LOGICAL width (rect.width)
        const maxBlocks = Math.ceil(rect.width / STRIDE);
        if (blocksRef.current.length === 0) {
            blocksRef.current = [];
        }

        const draw = (timestamp: number) => {
            animationRef.current = requestAnimationFrame(draw);

            // 1. RMS Calculation
            analyser.getByteTimeDomainData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                const x = (dataArray[i] - 128) / 128.0;
                sum += x * x;
            }
            const rms = Math.sqrt(sum / bufferLength);
            if (rms > currentMaxAmplitudeRef.current) {
                currentMaxAmplitudeRef.current = rms;
            }

            // 2. Smooth Scrolling Offset
            // Calculate progress (0 to 1) towards the next update
            let timeDelta = timestamp - lastUpdateRef.current;

            // Safety cap to prevent huge jumps if tab was inactive
            if (timeDelta > 500) {
                lastUpdateRef.current = timestamp;
                timeDelta = 0;
            }

            // If interval passed, push new block
            if (timeDelta >= UPDATE_INTERVAL) {
                lastUpdateRef.current = timestamp;
                // Reduce delta by interval to keep smooth timing phase
                // timeDelta -= UPDATE_INTERVAL; // (Actually simpler to just reset to timestamp for animation logic consistency or handle phase carefully)
                // For simplicity:

                // Volume Scaling (Logarithmic/Hard saturation)
                const gain = 5; // Reduced from 30 to 5
                const noiseFloor = 0.01;
                const raw = Math.max(0, currentMaxAmplitudeRef.current - noiseFloor);
                const amplitude = 1 - Math.exp(-raw * gain);

                currentMaxAmplitudeRef.current = 0;
                blocksRef.current.unshift(amplitude);
                if (blocksRef.current.length > maxBlocks + 2) { // Keep a buffer
                    blocksRef.current.pop();
                }

                // Reset delta for visual calculation since we consumed the "tick"
                timeDelta = 0;
            }

            // Interpolate offset: 0 -> STRIDE over UPDATE_INTERVAL
            const progress = Math.min(1, timeDelta / UPDATE_INTERVAL);
            const offset = progress * STRIDE;


            // 3. Draw
            // Clear based on LOGICAL size since we scaled
            canvasCtx.clearRect(0, 0, rect.width, rect.height);
            canvasCtx.fillStyle = '#F8CD32';
            canvasCtx.fillRect(0, 0, rect.width, rect.height);

            canvasCtx.fillStyle = '#303030';

            // Draw Blocks
            // New blocks enter from LEFT (index 0). 
            // We want them to slide RIGHT.
            // X position = (index * STRIDE) + offset

            blocksRef.current.forEach((amp, index) => {
                const x = (index * STRIDE) + offset;

                // Optimization: Don't draw off-screen
                if (x > rect.width) return;

                // Height Logic
                const h = Math.max(2, amp * rect.height * 0.8);
                const y = (rect.height - h) / 2;

                canvasCtx.fillRect(x, y, BAR_WIDTH, h);
            });

            // "Preview" block at the start?
            // Drawn at x = offset - STRIDE
            // This fills the gap appearing on the left.
            const previewX = offset - STRIDE;
            if (previewX + BAR_WIDTH > 0) {
                const noiseFloor = 0.01;
                const raw = Math.max(0, currentMaxAmplitudeRef.current - noiseFloor);
                const currentAmp = 1 - Math.exp(-raw * 5); // Match gain 5
                const h = Math.max(2, currentAmp * rect.height * 0.8);
                const y = (rect.height - h) / 2;
                canvasCtx.fillRect(previewX, y, BAR_WIDTH, h);
            }
        };

        requestAnimationFrame((t) => {
            lastUpdateRef.current = t;
            draw(t);
        });

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            audioContext.close();
        };
    }, [stream]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full rounded-full"
        />
    );
}
