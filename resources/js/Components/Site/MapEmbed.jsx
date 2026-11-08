import { ExternalLink, MapPin } from 'lucide-react';
import { useState } from 'react';

/** The Google Maps page for an embed link, to open the map in Google Maps itself. */
function mapsPage(embedUrl) {
    try {
        const url = new URL(embedUrl);
        url.searchParams.delete('output'); // maps?q=…&output=embed → the ordinary map page
        return url.toString();
    } catch {
        return embedUrl;
    }
}

/**
 * A Google Map that loads only when someone asks for it. The embed is a large download, which on a
 * weak signal would compete with the rest of the page; until then a placeholder of the same size
 * offers to show it here or open it in Google Maps.
 */
export default function MapEmbed({ url, address, title }) {
    const [shown, setShown] = useState(false);

    if (shown) {
        return <iframe title={title} src={url} className="h-[380px] w-full border-0 grayscale-[30%]" referrerPolicy="no-referrer-when-downgrade" />;
    }

    return (
        <div className="flex h-[380px] w-full flex-col items-center justify-center gap-4 bg-forest-50 px-4 text-center">
            <MapPin className="h-10 w-10 text-forest-600" aria-hidden />
            {address && <p className="font-display text-lg text-forest-800">{address}</p>}
            <div className="flex flex-wrap justify-center gap-3">
                <button type="button" onClick={() => setShown(true)} className="btn-primary">
                    <MapPin className="h-4 w-4" /> Show map
                </button>
                <a href={mapsPage(url)} target="_blank" rel="noreferrer" className="btn-outline">
                    <ExternalLink className="h-4 w-4" /> Open in Google Maps
                </a>
            </div>
        </div>
    );
}
