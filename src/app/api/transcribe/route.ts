import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import os from "os";

// Initialize OpenAI Client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Convert to Buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Create a temporary file path
        const tempFilePath = path.join(os.tmpdir(), `${uuidv4()}.webm`);

        // Write file to temp
        await fs.promises.writeFile(tempFilePath, buffer);

        // Call Whisper API
        // Note: We create a read stream from the temp file
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempFilePath),
            model: "whisper-1",
            language: "de", // Force German detection for this app context
        });

        // Cleanup: Delete temp file
        await fs.promises.unlink(tempFilePath);

        return NextResponse.json({ text: transcription.text });
    } catch (error: any) {
        console.error("Transcription error:", error);
        return NextResponse.json(
            { error: "Failed to transcribe audio", details: error.message },
            { status: 500 }
        );
    }
}
