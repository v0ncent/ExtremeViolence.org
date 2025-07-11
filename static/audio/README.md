# Easter Egg Audio Setup

To complete the FNAF jumpscare easter egg, you need to:

1. Download the audio from: https://www.youtube.com/watch?v=r11mz5jvHaU
2. Convert it to MP3 format
3. Save it as `jumpscare-sound.mp3` in this directory
4. Uncomment the audio.src line in `src/lib/components/atoms/EasterEgg.svelte`

## How to download and convert:

### Option 1: Using yt-dlp (recommended)

```bash
# Install yt-dlp if you haven't already
pip install yt-dlp

# Download and convert to MP3
yt-dlp -x --audio-format mp3 -o "jumpscare-sound.%(ext)s" https://www.youtube.com/watch?v=r11mz5jvHaU

# Move the file to this directory
mv jumpscare-sound.mp3 static/audio/
```

### Option 2: Manual download

1. Use a YouTube to MP3 converter website
2. Download the audio from the video
3. Save it as `jumpscare-sound.mp3` in this directory

## After setting up the audio:

1. Open `src/lib/components/atoms/EasterEgg.svelte`
2. Find the line: `// audio.src = '/audio/jumpscare-sound.mp3';`
3. Remove the `//` to uncomment it
4. The easter egg will now play the audio when triggered!
