import { FiLoader } from 'react-icons/fi';

const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-50">
        <FiLoader className={`${sizeClasses.lg} text-primary-600 animate-spin`} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <FiLoader className={`${sizeClasses[size]} text-primary-600 animate-spin`} />
    </div>
  );
};

export default LoadingSpinner;
