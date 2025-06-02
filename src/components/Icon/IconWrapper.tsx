import { IconType } from 'react-icons';
import React from 'react';

interface IconWrapperProps {
    icon: IconType;
    size?: number;
    color?: string;
}

const IconWrapper: React.FC<IconWrapperProps> = ({ icon: Icon, size, color }) => {
    return <Icon size={size} color={color} />;
};

export default IconWrapper; 