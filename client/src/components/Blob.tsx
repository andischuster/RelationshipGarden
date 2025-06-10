interface BlobProps {
  color: string;
  className?: string;
}

export default function Blob({ color, className = "" }: BlobProps) {
  return (
    <div 
      className={`absolute pointer-events-none z-0 ${className}`}
      style={{
        background: `radial-gradient(circle, ${color}20 0%, ${color}10 40%, transparent 70%)`,
        borderRadius: '50% 40% 60% 30%',
        filter: 'blur(40px)',
      }}
    />
  );
}