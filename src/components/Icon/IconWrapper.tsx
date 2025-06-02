import { IconType } from 'react-icons';
import React from 'react';

interface IconWrapperProps {
    icon: IconType;
    size?: number;
    color?: string;
    className?: string;
}

const IconWrapper: React.FC<IconWrapperProps> = ({ icon: Icon, size, color, className }) => {
    const IconComponent = Icon as React.ComponentType<{
        size?: number;
        color?: string;
        className?: string;
    }>;
    return <IconComponent size={size} color={color} className={className} />;
};

export default IconWrapper;