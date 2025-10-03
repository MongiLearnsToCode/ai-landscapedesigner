import React from 'react';
import type { RedesignDensity } from '../types';

interface DensitySelectorProps {
  value: RedesignDensity;
  onChange: (value: RedesignDensity) => void;
}

const DENSITY_OPTIONS: { id: RedesignDensity; name: string; description: string }[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Fewer elements, more open space.',
  },
  {
    id: 'default',
    name: 'Balanced',
    description: 'A standard, well-rounded design.',
  },
  {
    id: 'lush',
    name: 'Lush',
    description: 'Abundant with plants and features.',
  },
];

export const DensitySelector: React.FC<DensitySelectorProps> = ({ value, onChange }) => {
  return (
    <div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {DENSITY_OPTIONS.map((option) => (
          <div key={option.id} className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => onChange(option.id)}
              className={`w-full px-2 py-2 text-sm font-medium rounded-lg transition-colors duration-200 border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-400 ${
                value === option.id
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-slate-100/80 text-slate-700 border-slate-200/80 hover:bg-slate-200'
              }`}
              aria-pressed={value === option.id}
            >
              {option.name}
            </button>
            <p className="text-xs text-slate-400 mt-1 px-1 h-10 flex items-center justify-center">
              {option.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
