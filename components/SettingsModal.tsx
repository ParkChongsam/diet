
import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface SettingsModalProps {
  currentGoal: number;
  onSave: (newGoal: number) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ currentGoal, onSave, onClose }) => {
  const [goal, setGoal] = useState(currentGoal);

  const handleSave = () => {
    if (goal > 0) {
      onSave(goal);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <label htmlFor="daily-goal" className="block text-lg font-medium text-gray-700">
            Your Daily Calorie Goal
          </label>
          <div className="mt-2 flex items-center">
            <input
              id="daily-goal"
              type="number"
              value={goal}
              onChange={(e) => setGoal(parseInt(e.target.value) || 0)}
              className="flex-grow w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-lg"
              placeholder="e.g., 2000"
            />
            <span className="ml-3 text-lg text-gray-500">kcal</span>
          </div>
          <p className="mt-2 text-sm text-gray-500">Set a target for your daily calorie intake.</p>
        </div>
        <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-end">
          <button
            onClick={handleSave}
            className="px-8 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary transition-colors disabled:bg-gray-300"
            disabled={goal <= 0}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
