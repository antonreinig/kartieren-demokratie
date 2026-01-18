import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Schema for synthesis response
const synthesisSchema = z.object({
    commonalities: z.array(z.object({
        text: z.string().describe("A shared value, goal, or concern that appears across multiple perspectives"),
    })).max(4).describe("Maximum 4 shared themes across perspectives"),

    tensionFields: z.array(z.object({
        leftLabel: z.string().describe("One end of the spectrum (e.g., 'Freiwilligkeit')"),
        rightLabel: z.string().describe("Other end of the spectrum (e.g., 'Zwang')"),
        clusters: z.array(z.object({
            position: z.number().min(0).max(1).describe("Position on spectrum: 0=left, 0.5=center, 1=right"),
            profileIds: z.array(z.string()).describe("IDs of profiles in this cluster"),
            summary: z.string().describe("Short summary of this cluster's position"),
        })),
    })).max(4).describe("Maximum 4 tension fields/polarizing dimensions"),
});

export async function POST(request: NextRequest) {
    try {
        const { topicId } = await request.json();

        if (!topicId) {
            return NextResponse.json(
                { error: "topicId is required" },
                { status: 400 }
            );
        }

        // Fetch all profiles for this topic
        const profiles = await prisma.userProfile.findMany({
            where: { topicId },
            select: {
                id: true,
                profileTitle: true,
                overallAttitude: true,
                coreValues: true,
                keyConcerns: true,
                redLines: true,
                counterarguments: true,
                conditionsForChange: true,
                characterization: true,
            },
        });

        if (profiles.length < 2) {
            return NextResponse.json({
                synthesis: null,
                message: "Mindestens 2 Perspektiven nötig für Vergleich",
                profileCount: profiles.length,
            });
        }

        // Format profiles for AI analysis
        const profileSummaries = profiles.map((p, i) => `
PERSPEKTIVE ${i + 1} (ID: ${p.id}):
Titel: ${p.profileTitle}
Haltung: ${p.overallAttitude}
Kernwerte: ${JSON.stringify(p.coreValues)}
Hauptsorgen: ${JSON.stringify(p.keyConcerns)}
Rote Linien: ${JSON.stringify(p.redLines)}
Charakterisierung: ${p.characterization}
`).join("\n---\n");

        // Generate synthesis with AI
        const { object: synthesis } = await generateObject({
            model: openai("gpt-4o"),
            schema: synthesisSchema,
            prompt: `Du bist ein Experte für deliberative Demokratie und Perspektivenanalyse.

Analysiere die folgenden ${profiles.length} Perspektiven zum gleichen Thema und erstelle:

1. GEMEINSAMKEITEN (max 4): Finde gemeinsame Werte, Ziele oder Sorgen, die sich über mehrere Perspektiven hinweg zeigen. Diese sollen verbindend wirken.

2. SPANNUNGSFELDER (max 4): Identifiziere die wichtigsten Dimensionen, auf denen sich die Perspektiven unterscheiden. Formuliere sie als Gegensatzpaare.

WICHTIG - Positionierung auf dem Spektrum:
- leftLabel = Ein Pol (z.B. "Freiwilligkeit", "Militärisch")
- rightLabel = Gegengesetzter Pol (z.B. "Zwang", "Zivil")
- Du kannst 2-4 Cluster pro Spannungsfeld erstellen, je nach Verteilung der Meinungen
- Jeder Cluster hat eine Position zwischen 0.0 und 1.0:
  • Position 0.0-0.2 = stark auf Seite des leftLabel
  • Position 0.3-0.4 = leicht auf Seite des leftLabel  
  • Position 0.45-0.55 = neutral/mittig
  • Position 0.6-0.7 = leicht auf Seite des rightLabel
  • Position 0.8-1.0 = stark auf Seite des rightLabel

REGEL: Der Inhalt der summary MUSS zur Position passen!
- Cluster mit summary "befürwortet Freiwilligkeit" → Position nahe 0
- Cluster mit summary "befürwortet Zwang" → Position nahe 1
- Cluster mit summary "gemischte Position" → Position nahe 0.5

PERSPEKTIVEN:
${profileSummaries}

Achte darauf:
- Jedes Profil muss in GENAU EINEM Cluster pro Spannungsfeld sein
- Die summary beschreibt WAS die Perspektiven in diesem Cluster gemeinsam haben
- Die Position zeigt WO auf dem Spektrum sie stehen`,
        });

        // Add profile IDs to each commonality (identify which profiles share it)
        const commonalitiesWithProfiles = synthesis.commonalities.map(c => ({
            ...c,
            profileIds: profiles.map(p => p.id), // For now, assume all profiles share commonalities
        }));

        // Store in database
        const savedSynthesis = await prisma.perspektiveSynthesis.upsert({
            where: { topicId },
            create: {
                topicId,
                commonalities: commonalitiesWithProfiles,
                tensionFields: synthesis.tensionFields,
                profileCount: profiles.length,
            },
            update: {
                commonalities: commonalitiesWithProfiles,
                tensionFields: synthesis.tensionFields,
                profileCount: profiles.length,
            },
        });

        return NextResponse.json({
            synthesis: savedSynthesis,
            profileCount: profiles.length,
        });

    } catch (error) {
        console.error("Synthesis generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate synthesis" },
            { status: 500 }
        );
    }
}

// GET: Retrieve existing synthesis
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get("topicId");

    if (!topicId) {
        return NextResponse.json(
            { error: "topicId is required" },
            { status: 400 }
        );
    }

    // Get current profile count
    const profileCount = await prisma.userProfile.count({
        where: { topicId },
    });

    // Get cached synthesis
    const synthesis = await prisma.perspektiveSynthesis.findUnique({
        where: { topicId },
    });

    // Check if stale (profile count changed)
    const isStale = synthesis && synthesis.profileCount !== profileCount;

    return NextResponse.json({
        synthesis,
        profileCount,
        isStale,
        needsGeneration: !synthesis || isStale,
    });
}
