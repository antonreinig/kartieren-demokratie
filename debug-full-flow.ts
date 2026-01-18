import ytdl from '@distube/ytdl-core';

// Mock functions from route.ts
function parseTranscriptXml(xml: string): string {
    const matches = xml.matchAll(/<text[^>]*>([^<]+)<\/text>/g);
    const texts = Array.from(matches).map(m => m[1]);
    return texts.join(' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
}

const url = 'https://www.youtube.com/watch?v=_A2MwygtCNU';

console.log(`Analyzing URL: ${url}`);

(async () => {
    try {
        console.log("1. Fetching Video Info...");
        const info = await ytdl.getInfo(url);
        console.log(`   Title: ${info.videoDetails.title}`);

        const tracks = info.player_response.captions?.playerCaptionsTracklistRenderer?.captionTracks;

        if (tracks && tracks.length > 0) {
            console.log(`   Found ${tracks.length} caption tracks.`);

            const track = tracks.find((t: any) => t.languageCode === 'de')
                || tracks.find((t: any) => t.languageCode === 'en')
                || tracks[0];

            console.log(`   Selected track language: ${track.languageCode}`);
            console.log(`   Track URL: ${track.baseUrl}`);

            if (track?.baseUrl) {
                console.log("2. Fetching Transcript XML...");
                const transcriptRes = await fetch(track.baseUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                });

                console.log(`   Status: ${transcriptRes.status} ${transcriptRes.statusText}`);
                const transcriptXml = await transcriptRes.text();

                console.log(`   XML Length: ${transcriptXml.length}`);

                console.log("3. Parsing Transcript...");
                const fullTranscript = parseTranscriptXml(transcriptXml);

                console.log("\n--- RESULT TRANSCRIPT PREVIEW (First 500 chars) ---");
                console.log(fullTranscript.substring(0, 500));
                console.log("---------------------------------------------------");

                if (fullTranscript.length < 50) {
                    console.log("WARNING: Transcript seems suspiciously short!");
                    console.log("Raw XML Preview:");
                    console.log(transcriptXml.substring(0, 500));
                }

            } else {
                console.error("   Error: Track has no baseUrl.");
            }
        } else {
            console.error("   Error: No caption tracks found in player_response.");
        }

    } catch (err: any) {
        console.error('FULL FLOW FAILED:');
        console.error(err);
    }
})();
