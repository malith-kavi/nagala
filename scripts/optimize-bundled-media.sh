#!/bin/bash
# Makes the compact copies of the site's bundled photos and sounds that the pages load:
#   - AVIF versions of the hero photos, the page-header photo and the pinned home background,
#     plus phone-sized copies (and WebP ones for browsers without AVIF)
#   - WebP versions of the drifting-cloud layers
#   - AAC (.m4a) versions of the background sounds
# It only writes new files and never changes its inputs, so it is safe to run again, for example
# after replacing one of the inputs. Inputs not served to visitors live in resources/media-originals.
#
# Needs cwebp, avifenc and ffmpeg (brew install webp libavif ffmpeg) and macOS's sips. The outputs
# are committed, so the web server needs none of this.
set -euo pipefail
shopt -s nullglob
cd "$(dirname "$0")/.."

IMAGES=public/images
AUDIO=public/audio
ORIGINALS=resources/media-originals
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# png <image> <width|full>: a decoded PNG copy for the encoders, resized to <width> pixels wide.
png() {
    local out
    out="$TMP/$(basename "$1")-$2.png"
    if [ "$2" = full ]; then
        sips -s format png "$1" --out "$out" >/dev/null
    else
        sips -s format png --resampleWidth "$2" "$1" --out "$out" >/dev/null
    fi
    echo "$out"
}

webp() { cwebp -quiet -m 6 -sharp_yuv -q "$3" "$1" -o "$2"; }       # webp <png> <out> <quality>
avif() { avifenc -s 4 -y 420 -j all -q "$3" "$1" "$2" >/dev/null; }  # avif <png> <out> <quality>

echo "Hero photos"
# Sunset (light mode). The desktop size comes from the original photo and is seen close to pixel
# for pixel, so a higher quality; phone sizes come from the 2x upscale, whose pixels phones draw
# smaller than a dot on screen.
hero="$IMAGES/hero_l"
avif "$(png "$hero.jpg" full)" "$hero.avif" 58
avif "$(png "$hero-2x.webp" full)" "$hero-2x.avif" 50
mid=$(png "$hero-2x.webp" 2500)
avif "$mid" "$hero-2500.avif" 50
webp "$mid" "$hero-2500.webp" 75
# Night (dark mode): WebP only. AVIF smooths away the faintest stars, even at high quality.
webp "$(png "$IMAGES/hero_d-2x.webp" 2500)" "$IMAGES/hero_d-2500.webp" 75

echo "Page header and home background (both sit under a dark gradient)"
header="$IMAGES/design/cliffs-header"
avif "$(png "$header.webp" full)" "$header.avif" 50
for width in 768 1280; do
    small=$(png "$header.webp" "$width")
    avif "$small" "$header-$width.avif" 50
    webp "$small" "$header-$width.webp" 75
done
avif "$(png "$IMAGES/design/nearby-bg.webp" full)" "$IMAGES/design/nearby-bg.avif" 50

echo "Drifting-cloud layers"
for layer in clouds-screen clouds-multiply sky-light; do
    webp "$(png "$ORIGINALS/hero_l-$layer.jpg" full)" "$IMAGES/hero_l-$layer.webp" 70
done

echo "Background sounds"
# Apple's AAC encoder sounds best; ffmpeg's own is the fallback. +faststart puts the index first,
# so playback starts before the whole file has arrived.
encoders=$(ffmpeg -hide_banner -encoders 2>/dev/null)
[[ $encoders == *" aac_at "* ]] && encoder=aac_at || encoder=aac
# The birdsong recording is mono (both channels identical); the night chorus is real stereo.
ffmpeg -v error -y -i "$ORIGINALS/audio/birdsong.mp3" -ac 1 -c:a "$encoder" -b:a 56k -movflags +faststart "$AUDIO/birdsong.m4a"
ffmpeg -v error -y -i "$ORIGINALS/audio/night.mp3" -c:a "$encoder" -b:a 64k -movflags +faststart "$AUDIO/night.m4a"

echo
ls -l "$IMAGES"/hero_?.avif "$IMAGES"/hero_?-2*.{avif,webp} "$IMAGES"/design/*.avif "$IMAGES"/design/cliffs-header-*.webp \
    "$IMAGES"/hero_l-{clouds-screen,clouds-multiply,sky-light}.webp "$AUDIO"/*.m4a | awk '{ printf "%8.0f kB  %s\n", $5 / 1024, $NF }'
