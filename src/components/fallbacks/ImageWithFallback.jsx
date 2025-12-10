import React, {useState} from "react";

export function ImageWithFallback({src, fallback, alt, className}) {
    const [imgSrc, setImgSrc] = useState(src);

    return (
        <img
            src={imgSrc}
            alt={alt}
            className={className}
            onError={() => fallback && setImgSrc(fallback)}
        />
    );
}

export default ImageWithFallback;
