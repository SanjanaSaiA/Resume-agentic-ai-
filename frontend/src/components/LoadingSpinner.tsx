/**
 * Loading Spinner Component
 */
import React from 'react';
import clsx from 'clsx';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

export default function LoadingSpinner({ size = 'medium', className }: LoadingSpinnerProps) {
    const sizeClasses = {
        small: 'w-4 h-4 border-2',
        medium: 'w-8 h-8 border-3',
        large: 'w-12 h-12 border-4',
    };

    return (
        <div className={clsx('flex items-center justify-center', className)}>
            <div
                className={clsx(
                    'animate-spin rounded-full border-primary-600 border-t-transparent',
                    sizeClasses[size]
                )}
            />
        </div>
    );
}
