import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const url = 'https://www.youtube.com/watch?v=_A2MwygtCNU';

console.log(`Analyzing URL with yt-dlp: ${url}`);

(async () => {
    try {
        // Fetch subtitles in verbose mode to see what happens
        // --write-auto-sub: write auto-generated subs
        // --skip-download: don't download video
        // --sub-lang de,en: prefer German then English
        // --print subtitles: print subs to stdout? No, yt-dlp usually writes files.
        // But we can use --dump-json to get the URLS!

        console.log("Fetching JSON...");
        const { stdout } = await execAsync(`yt-dlp --dump-json "${url}"`);
        const info = JSON.parse(stdout);

        console.log(`Title: ${info.title}`);

        // Check for automatic_captions or subtitles
        const auto = info.automatic_captions || {};
        const manual = info.subtitles || {};

        const de = manual.de || auto.de || manual.en || auto.en;

        if (de) {
            console.log("Found captions!");
            // Prefer json3 or vtt
            const track = de.find((t: any) => t.ext === 'vtt') || de[0];
            console.log(`URL: ${track.url}`);

            // Try fetching
            const res = await fetch(track.url);
            console.log(`Fetch Status: ${res.status}`);
            const text = await res.text();
            console.log(`Length: ${text.length}`);
            console.log("Preview:", text.substring(0, 200));
        } else {
            console.log("No captions found in JSON dump.");
            console.log("Keys in auto:", Object.keys(auto));
            console.log("Keys in manual:", Object.keys(manual));
        }

    } catch (err: any) {
        console.error('FAILED:');
        console.error(err.message);
    }
})();
