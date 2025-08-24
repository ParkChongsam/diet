
import React from 'react';
import { SettingsIcon } from './icons/SettingsIcon';
import { LogoIcon } from './icons/LogoIcon';

interface HeaderProps {
  dailyTotal: number;
  dailyGoal: number;
  onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ dailyTotal, dailyGoal, onSettingsClick }) => {
  const progress = dailyGoal > 0 ? Math.min((dailyTotal / dailyGoal) * 100, 100) : 0;
  const isOver = dailyTotal > dailyGoal;

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 md:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <LogoIcon className="h-8 w-8 text-brand-primary" />
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Calorie Vision</h1>
          </div>
          <div className="flex items-center space-x-4">
             <div className="w-48 hidden sm:block">
               <div className="text-right">
                  <span className={`font-bold ${isOver ? 'text-red-500' : 'text-gray-700'}`}>
                    {Math.round(dailyTotal)}
                  </span>
                  <span className="text-gray-500"> / {dailyGoal} kcal</span>
               </div>
               <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full ${isOver ? 'bg-red-500' : 'bg-brand-primary'}`}
                    style={{ width: `${progress}%` }}
                  ></div>
               </div>
             </div>
             <button
              onClick={onSettingsClick}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-colors"
              aria-label="Open settings"
            >
              <SettingsIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
