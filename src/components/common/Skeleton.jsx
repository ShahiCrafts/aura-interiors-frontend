import React from 'react';

export default function Skeleton({ className = '', variant = 'rectangle', width, height }) {
    const baseClasses = 'bg-neutral-200 animate-pulse';

    const variantClasses = {
        rectangle: 'rounded-md',
        circle: 'rounded-full',
        text: 'rounded-sm h-4 mb-2 last:mb-0',
    };

    const style = {
        width: width || undefined,
        height: height || undefined,
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
        />
    );
}
