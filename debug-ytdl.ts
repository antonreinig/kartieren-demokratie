import ytdl from '@distube/ytdl-core';

const url = 'https://www.youtube.com/watch?v=_A2MwygtCNU';

console.log(`Fetching info for: ${url}`);

(async () => {
    try {
        const info = await ytdl.getInfo(url);
        const tracks = info.player_response.captions?.playerCaptionsTracklistRenderer?.captionTracks;

        if (tracks && tracks.length > 0) {
            console.log('Found tracks:', tracks.length);
            console.log('First track:', tracks[0]);

            // Try fetching the first track
            const trackUrl = tracks[0].baseUrl;
            const res = await fetch(trackUrl);
            const text = await res.text();
            console.log('Fetched XML (first 200 chars):', text.substring(0, 200));
        } else {
            console.log('No caption tracks found.');
        }

    } catch (err: any) {
        console.error('FAILED to fetch info.');
        console.error(err);
    }
})();
