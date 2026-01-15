// Generates a deterministic gradient based on a string (e.g., guestToken)
export function generateGradientFromToken(token: string): { from: string; to: string } {
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
        const char = token.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    // Use hash to generate two hue values
    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 40 + Math.abs((hash >> 8) % 80)) % 360; // Offset by 40-120 degrees

    // Generate vibrant colors with good saturation and lightness
    const saturation = 70 + Math.abs((hash >> 16) % 20); // 70-90%
    const lightness = 55 + Math.abs((hash >> 24) % 15); // 55-70%

    return {
        from: `hsl(${hue1}, ${saturation}%, ${lightness}%)`,
        to: `hsl(${hue2}, ${saturation}%, ${lightness}%)`
    };
}

// Generate CSS gradient string
export function getGradientStyle(token: string): string {
    const { from, to } = generateGradientFromToken(token);
    return `linear-gradient(135deg, ${from}, ${to})`;
}
