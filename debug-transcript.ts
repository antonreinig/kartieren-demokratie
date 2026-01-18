import { YoutubeTranscript } from 'youtube-transcript';

const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

console.log(`Fetching transcript for: ${url}`);

YoutubeTranscript.fetchTranscript(url)
    .then((transcript) => {
        console.log('Success!');
        console.log('Transcript length:', transcript.length);
        console.log('First 5 lines:', transcript.slice(0, 5));
    })
    .catch((err) => {
        console.error('FAILED to fetch transcript.');
        console.error('Error name:', err.name);
        console.error('Error message:', err.message);
        if (console.dir) console.dir(err);
    });
