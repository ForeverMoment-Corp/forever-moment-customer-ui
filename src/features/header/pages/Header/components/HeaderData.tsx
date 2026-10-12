import React from 'react';
import {
    CakeIcon,
    HeartIcon,
    RingsIcon,
    GiftIcon,
    SparklesIcon,
    CandleIcon,
    StarIcon,
} from './HeaderIcons';

export const iconMap: Record<string, React.ReactNode> = {
    'Birthday': <CakeIcon />,
    'Anniversary': <HeartIcon />,
    'Wedding': <RingsIcon />,
    'Gifts': <GiftIcon />,
    'Festivals': <SparklesIcon />,
    'Candlelight Dinner': <CandleIcon />,
    'Decorations': <SparklesIcon />,
    "Kid's Celebration": <StarIcon />,
};

export const defaultIcon = <StarIcon />;
