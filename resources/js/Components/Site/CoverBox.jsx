/**
 * A box exactly where `object-cover` draws a photo of the given aspect ratio inside the parent,
 * so overlays can be placed in the photo's own coordinates (percentages of its width and height).
 */
export default function CoverBox({ ratio, className = '', style = {}, children }) {
    return (
        <div aria-hidden className={`pointer-events-none overflow-hidden [container-type:size] ${className}`}>
            <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ width: `max(100cqw, calc(100cqh * ${ratio}))`, height: `max(100cqh, calc(100cqw / ${ratio}))`, ...style }}
            >
                {children}
            </div>
        </div>
    );
}
