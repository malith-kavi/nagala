import Modal from '@/Components/Modal';
import { holdBirdsong } from '@/Components/Site/Birdsong';
import { youtubeEmbed } from '@/lib/format';
import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function VideoModal({ show, onClose, url }) {
    const src = youtubeEmbed(url);

    useEffect(() => {
        if (!show) return;
        holdBirdsong(true);
        return () => holdBirdsong(false);
    }, [show]);

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="relative bg-black">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-2 top-2 z-10 rounded-full bg-black/60 p-1.5 text-white hover:bg-black"
                    aria-label="Close video"
                >
                    <X className="h-5 w-5" />
                </button>
                {show && src ? (
                    <div className="aspect-video">
                        <iframe
                            src={src}
                            title="Nagala Eco Cottage video"
                            className="h-full w-full"
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                ) : (
                    <div className="flex aspect-video items-center justify-center p-8 text-center text-cream-200">
                        Our video is coming soon. Stay tuned!
                    </div>
                )}
            </div>
        </Modal>
    );
}
