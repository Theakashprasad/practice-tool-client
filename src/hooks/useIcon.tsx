import { IconType } from 'react-icons';
import { useMemo } from 'react';

export const useIcon = (Icon: IconType, size?: number, color?: string) => {
    return useMemo(() => {
        const IconComponent = Icon as any;
        return <IconComponent size={size} color={color} />;
    }, [Icon, size, color]);
}; 