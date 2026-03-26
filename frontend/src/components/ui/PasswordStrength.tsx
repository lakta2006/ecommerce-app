import React from 'react';
import { cn } from '@/utils';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface Requirement {
  label: string;
  test: (pwd: string) => boolean;
}

const requirements: Requirement[] = [
  { label: '٨ أحرف على الأقل', test: (pwd) => pwd.length >= 8 },
  { label: 'حرف كبير واحد على الأقل', test: (pwd) => /[A-Z]/.test(pwd) },
  { label: 'حرف صغير واحد على الأقل', test: (pwd) => /[a-z]/.test(pwd) },
  { label: 'رقم واحد على الأقل', test: (pwd) => /\d/.test(pwd) },
  { label: 'رمز خاص واحد على الأقل', test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
];

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password, className }) => {
  const getStrengthScore = () => {
    return requirements.filter((req) => req.test(password)).length;
  };

  const getStrengthLabel = () => {
    const score = getStrengthScore();
    if (score <= 2) return { text: 'ضعيفة', color: 'text-red-600', barColor: 'bg-red-500' };
    if (score <= 3) return { text: 'متوسطة', color: 'text-yellow-600', barColor: 'bg-yellow-500' };
    if (score <= 4) return { text: 'جيدة', color: 'text-blue-600', barColor: 'bg-blue-500' };
    return { text: 'قوية', color: 'text-green-600', barColor: 'bg-green-500' };
  };

  const score = getStrengthScore();
  const strength = getStrengthLabel();
  const percentage = (score / requirements.length) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn('h-full transition-all duration-300', strength.barColor)}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={cn('text-xs font-medium whitespace-nowrap', strength.color)}>
          {strength.text}
        </span>
      </div>

      {/* Requirements list */}
      <ul className="space-y-1">
        {requirements.map((req, index) => {
          const met = req.test(password);
          return (
            <li
              key={index}
              className={cn(
                'text-xs flex items-center gap-2',
                met ? 'text-green-600' : 'text-gray-500'
              )}
            >
              <svg
                className={cn('w-4 h-4 flex-shrink-0', met ? 'opacity-100' : 'opacity-30')}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                {met ? (
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                )}
              </svg>
              {req.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
