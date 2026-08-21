import React from 'react';
import * as Icons from 'lucide-react';

interface VectorIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const VectorIcon: React.FC<VectorIconProps> = ({ name, className = 'w-4 h-4', size }) => {
  // @ts-ignore
  const IconComponent = Icons[name] || Icons.CircleDot;
  return <IconComponent className={className} size={size} />;
};

export default VectorIcon;
