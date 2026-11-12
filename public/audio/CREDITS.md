# Audio credits

The site plays the day sounds (light mode) and the night sounds (dark mode) in turn, crossfading from one to the next
(`resources/js/Components/Site/Birdsong.jsx`). All are mastered to about −27 LUFS so they hand over at the same loudness.

| File | Source | Author | License | Changes |
|---|---|---|---|---|
| `birdsong.m4a` | [File:Dawn chorus at Glencairnie big bungalow Craigmore DM.ogg](https://commons.wikimedia.org/wiki/File:Dawn_chorus_at_Glencairnie_big_bungalow_Craigmore_DM.ogg) — dawn chorus near Glencairnie big bungalow, Craigmore, Nilgiris, India | DivyaCM | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | Trimmed to 1:40–4:46, 180 Hz high-pass, crossfaded into a seamless 3-minute loop, loudness-normalised, encoded as 96 kbps MP3, then as 56 kbps mono AAC (the recording is mono) |
| `river.m4a` | [River side ambience in India, water flowing, birds, breeze](https://freesound.org/s/332419/) — banks of the Chalakudy River, Kerala, India | seventhsamurai | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | Trimmed to 0:01.5–1:55.5, 120 Hz high-pass, treble softened 3 dB above 8 kHz, crossfaded into a seamless 109-second loop, set to −27 LUFS, encoded as 96 kbps MP3, then as 64 kbps stereo AAC |
| `elephants.m4a` | Background: [Dawn Chorus From Himalayan Foothills](https://freesound.org/s/429048/) — Chapramari Wildlife Sanctuary, West Bengal, India | Calcuttan | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | Trimmed to 0:12–1:54, 150 Hz high-pass, cicadas softened (−7 dB around 7.5 kHz, −4 dB above 11 kHz), crossfaded into a seamless 97-second loop |
| | Elephant calls: [Elephant sound](https://freesound.org/s/819668/) — field recording of an elephant at a zoo | ikbenraar | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | A trumpet, a rumble and a roar cut out, filtered and given a reverb tail to sound distant, and placed five times over the background (two slightly lowered in pitch); the mix set to −27 LUFS, encoded as 96 kbps MP3, then as 64 kbps stereo AAC |
| `night.m4a` | [File:Nature sounds ambience in a Dordogne pond.ogg](https://commons.wikimedia.org/wiki/File:Nature_sounds_ambience_in_a_Dordogne_pond.ogg) — crickets and tree frogs at a pond at dusk, Dordogne, France | Glaneur de sons | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) | Trimmed to 0:00.5–0:56.5, 150 Hz high-pass, treble softened 3 dB above 6 kHz, crossfaded into a seamless 51-second loop, lowered to about −27 LUFS, encoded as 96 kbps MP3, then as 64 kbps stereo AAC |
| `night-paddy.m4a` | [Bali night dog insects geckos frogs2.wav](https://freesound.org/s/244765/) — rice field at night near Canggu, Bali, Indonesia | plymrphx | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | Trimmed to 0:16–2:18 (leaving out the dog), 150 Hz high-pass, treble softened 3 dB above 6 kHz, crossfaded into a seamless 116-second loop, set to −27 LUFS, encoded as 96 kbps MP3, then as 64 kbps stereo AAC |
| `night-river.m4a` | [River with slight water flow, lapping, with cricket and frog recorded at night in Amazon rainforest](https://freesound.org/s/673960/) | felix.blume | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | Trimmed to 0:20–2:14, 120 Hz high-pass, treble softened 2 dB above 8 kHz, gently compressed to even out the lapping, crossfaded into a seamless 108-second loop, set to −27 LUFS, encoded as 96 kbps MP3, then as 64 kbps stereo AAC |

CC BY requires the attribution shown in the site footer (DivyaCM, Calcuttan, Glaneur de sons). Keep each credit while
you use its recording; remove it if you replace that file with your own recording from Nagala. CC0 recordings need no
credit; they are listed here so their origin stays on record.

The MP3s are kept in `resources/media-originals/audio/`; `scripts/optimize-bundled-media.sh` makes
the `.m4a` files the site plays from them.
