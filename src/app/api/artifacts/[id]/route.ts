import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: "Artifact ID is required" },
                { status: 400 }
            );
        }

        // Delete the artifact
        await prisma.artifact.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete artifact error:", error);
        return NextResponse.json(
            { error: "Failed to delete artifact" },
            { status: 500 }
        );
    }
}
