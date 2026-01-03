import { cn } from '@/lib/utils';

interface ProductScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

const ProductScore = ({ score, size = 'md' }: ProductScoreProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'excellent-bg';
    if (score >= 50) return 'good-bg';
    if (score >= 25) return 'average-bg';
    return 'poor-bg';
  };

  const getScoreText = (score: number) => {
    if (score >= 75) return 'Excellent';
    if (score >= 50) return 'Good';
    if (score >= 25) return 'Average';
    return 'Poor';
  };

  // Calculate the circumference of the circle
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  // Calculate the dash offset based on the score (0-100)
  const dashOffset = circumference - (score / 100) * circumference;

  // Size classes
  const sizeClasses = {
    sm: 'w-20 h-20 text-sm',
    md: 'w-28 h-28 text-lg',
    lg: 'w-36 h-36 text-xl',
  };

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size])}>
      {/* Background circle */}
      <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="8"
          className="text-gray-200"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className={cn("transition-all duration-1000 ease-in-out", getScoreColor(score))}
        />
      </svg>

      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold">{score}/100</span>
        <span className="text-xs font-medium">{getScoreText(score)}</span>
      </div>
    </div>
  );
};

export default ProductScore;
