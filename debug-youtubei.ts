import { Innertube } from 'youtubei.js';

const videoId = '_A2MwygtCNU';

console.log(`Fetching transcript for ID: ${videoId}`);

(async () => {
    try {
        const youtube = await Innertube.create();
        const info = await youtube.getInfo(videoId);
        const transcriptData = await info.getTranscript();

        if (transcriptData && transcriptData.transcript) {
            const lines = transcriptData.transcript.content?.body?.initial_segments.map((seg: any) => seg.snippet.text) || [];
            console.log('Success!');
            console.log(`Found ${lines.length} lines.`);
            console.log('First 5 lines:', lines.slice(0, 5));
        } else {
            console.log('No transcript found.');
        }

    } catch (err: any) {
        console.error('FAILED to fetch transcript.');
        console.error(err);
    }
})();
