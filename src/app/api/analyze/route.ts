import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Helper to extract basic metadata using Regex (server-side, no DOM)
function extractMetadata(html: string, url: string) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i)
        || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i);

    // Simple absolute URL resolution (very basic)
    let imageUrl = ogImageMatch ? ogImageMatch[1] : null;
    if (imageUrl && !imageUrl.startsWith('http')) {
        try {
            imageUrl = new URL(imageUrl, url).toString();
        } catch (e) {
            // ignore invalid urls
        }
    }

    return {
        title: titleMatch ? titleMatch[1].trim() : '',
        image: imageUrl
    };
}

function cleanHtml(html: string) {
    // Remove scripts, styles, SVGs, paths to reduce token usage
    let text = html
        .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, "")
        .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gmi, "")
        .replace(/<svg\b[^>]*>([\s\S]*?)<\/svg>/gmi, "")
        .replace(/<footer\b[^>]*>([\s\S]*?)<\/footer>/gmi, "")
        .replace(/<nav\b[^>]*>([\s\S]*?)<\/nav>/gmi, "");

    // Remove all tags
    text = text.replace(/<[^>]+>/g, ' ');

    // Collapse whitespace
    return text.replace(/\s+/g, ' ').trim().substring(0, 15000); // Limit context
}

function parseWebVTT(vtt: string): string {
    return vtt
        .split('\n')
        .filter(line => !line.includes('-->') && line.trim() !== 'WEBVTT' && line.trim().length > 0)
        .map(line => line.replace(/<[^>]+>/g, '')) // Remove tags like <c>
        .join(' ');
}

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return new Response('URL is required', { status: 400 });
        }

        // 1. Fetch URL Content
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
            }
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch URL: ${res.statusText}`);
        }

        const html = await res.text();
        const metadata = extractMetadata(html, url);
        let textContent = cleanHtml(html);

        // Special handling for YouTube using yt-dlp
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            try {
                // Get video metadata and subtitles URL via yt-dlp
                // We use --dump-json to get the manifest which contains the subtitle URLs
                const { stdout } = await execAsync(`yt-dlp --dump-json --skip-download "${url}"`);
                const info = JSON.parse(stdout);

                const auto = info.automatic_captions || {};
                const manual = info.subtitles || {};
                const captions = manual.de || manual.en || auto.de || auto.en; // Prefer manual over auto

                if (captions) {
                    // Prefer vtt format
                    const track = captions.find((t: any) => t.ext === 'vtt') || captions[0];
                    if (track?.url) {
                        const subRes = await fetch(track.url);
                        const subText = await subRes.text();

                        const transcript = parseWebVTT(subText);

                        // Enhance context with transcript
                        textContent = `VIDEO TITLE: ${info.title}\n\nVIDEO TRANSCRIPT:\n${transcript}\n\nMETADATA:\n${textContent}`;
                        console.log("Transcript successfully fetched and added.");
                    }
                }
            } catch (e) {
                console.warn("Could not fetch YouTube transcript with yt-dlp:", e);
                // Fallback to HTML metadata logic
            }
        }

        // 2. Generate Insights with AI
        const { object } = await generateObject({
            model: openai('gpt-5.1'),
            schema: z.object({
                takeaways: z.array(z.string()).min(3).max(10).describe("3 to 10 key insights or takeaways from the content. Use more items for longer/complex content. Concise German."),
                category: z.enum(['Forschung', 'Erfahrung', 'Vorschlag', 'Wissen']).describe("The most fitting category for this content."),
                suggestedTitle: z.string().describe("A concise, descriptive title for the content. For YouTube videos, use the original title."),
                description: z.string().describe("A single sentence describing what this content is about (e.g., 'An interview about...', 'A research paper on...')."),
                evidenceLevel: z.enum(['Hoch', 'Mittel', 'Niedrig']).describe("The dominant evidence level of the content."),
                mainSource: z.enum(['Eigene Erfahrung', 'Studien / Wissenschaft', 'Journalistische / mediale Quellen', 'Expertenmeinung', 'Hörensagen / unspezifische Quellen', 'Unklar / nicht benannt']).describe("The primary source of the information."),
                contentCategories: z.object({
                    "Fakt / Sachinformation": z.number(),
                    "Beobachtung / Beschreibung": z.number(),
                    "Interpretation / Einordnung": z.number(),
                    "Meinung / Bewertung": z.number(),
                    "Erfahrung / persönliches Erleben": z.number(),
                    "Emotion / Gefühl": z.number(),
                    "Handlungsimpuls / Empfehlung": z.number(),
                    "Frage / Unsicherheit": z.number(),
                }).describe("Percentage distribution (0-100) across these categories. Sum should be approx 100.")
            }),
            prompt: `Analyze the following text content from a website. 
            The content is relevant to a democratic deliberation platform.
            
            URL Context: ${url}
            Extracted Title: ${metadata.title}
            
            Content:
            ${textContent}
            
            Please extract:
            1. 3 to 10 key takeaways/insights in German.
            2. The best matching category for our platform.
            3. A clean title in German. If it's a YouTube video, PREFER the original title.
            4. A one-sentence description.
            
            5. Evidenzgrad (Choose ONE):
               - Hoch: überprüfbare Fakten, Daten, Studien
               - Mittel: Mischung aus Fakten und Interpretationen
               - Niedrig: Meinungen, Erfahrungen, Gefühle
               Rule: Choose the DOMINANT level.

            6. Hauptquelle (Choose ONE):
               - Eigene Erfahrung
               - Studien / Wissenschaft
               - Journalistische / mediale Quellen
               - Expertenmeinung
               - Hörensagen / unspezifische Quellen
               - Unklar / nicht benannt
               Rule: Choose the most frequent/dominant source.

            7. Content Categories (Distribution in %):
               Assign a percentage (0-100) to each category based on its prevalence in the text.
               - Fakt / Sachinformation
               - Beobachtung / Beschreibung
               - Interpretation / Einordnung
               - Meinung / Bewertung
               - Erfahrung / persönliches Erleben
               - Emotion / Gefühl
               - Handlungsimpuls / Empfehlung
               - Frage / Unsicherheit
            `
        });

        // Use original title for YouTube if specific conditions met
        let finalTitle = object.suggestedTitle;
        if ((url.includes('youtube.com') || url.includes('youtu.be')) && metadata.title) {
            finalTitle = metadata.title;
        }

        return Response.json({
            success: true,
            data: {
                url,
                title: finalTitle,
                description: object.description,
                image: metadata.image,
                takeaways: object.takeaways,
                category: object.category,
                evidenceLevel: object.evidenceLevel,
                mainSource: object.mainSource,
                contentCategories: object.contentCategories
            }
        });

    } catch (error: any) {
        console.error("Analyze Error:", error);
        return Response.json({
            success: false,
            error: error.message || 'Failed to analyze URL'
        }, { status: 500 });
    }
}
