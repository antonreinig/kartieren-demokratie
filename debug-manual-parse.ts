const url = 'https://www.youtube.com/watch?v=_A2MwygtCNU';

console.log(`Fetching page: ${url}`);

(async () => {
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });
        const html = await res.text();
        console.log(`Page fetched. Length: ${html.length}`);

        // Look for captionTracks
        const match = html.match(/"captionTracks":(\[.*?\])/);
        if (match && match[1]) {
            const tracks = JSON.parse(match[1]);
            console.log(`Found ${tracks.length} manual caption tracks.`);

            const track = tracks.find((t: any) => t.languageCode === 'de')
                || tracks.find((t: any) => t.languageCode === 'en')
                || tracks[0];

            console.log(`Selected track: ${track.name.simpleText} (${track.languageCode})`);
            console.log(`URL: ${track.baseUrl}`);

            // Fetch it
            const subRes = await fetch(track.baseUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            console.log(`Status: ${subRes.status}`);
            const subText = await subRes.text();
            console.log(`XML Content Length: ${subText.length}`);
            console.log("Preview:", subText.substring(0, 200));

        } else {
            console.log("No captionTracks found in HTML regex.");
        }

    } catch (err) {
        console.error(err);
    }
})();
