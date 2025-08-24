
import React, { useState, useEffect } from 'react';
import type { FoodItem } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface FoodItemCardProps {
  item: FoodItem;
  onChange: (item: FoodItem) => void;
  onDelete: (id: string) => void;
}

export const FoodItemCard: React.FC<FoodItemCardProps> = ({ item, onChange, onDelete }) => {
  const [foodName, setFoodName] = useState(item.foodName);
  const [calories, setCalories] = useState(item.calories);
  const [servingSize, setServingSize] = useState(item.servingSizeGrams);

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange({ ...item, foodName, calories, servingSizeGrams: servingSize });
    }, 500); // Debounce changes
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foodName, calories, servingSize]);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start space-x-4">
      <div className="flex-grow">
        <input 
          type="text"
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
          className="w-full font-semibold text-lg text-gray-800 bg-transparent border-b border-transparent focus:border-brand-primary focus:outline-none transition-colors"
        />
        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
          <div>
            <label className="block text-xs text-gray-500">Calories</label>
            <div className="flex items-center">
              <input 
                type="number"
                value={calories}
                onChange={(e) => setCalories(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-20 bg-white border border-gray-300 rounded-md px-2 py-1 focus:ring-brand-primary focus:border-brand-primary"
              />
              <span className="ml-2">kcal</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500">Serving</label>
            <div className="flex items-center">
                <input 
                    type="number"
                    value={servingSize}
                    onChange={(e) => setServingSize(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-20 bg-white border border-gray-300 rounded-md px-2 py-1 focus:ring-brand-primary focus:border-brand-primary"
                />
                 <span className="ml-2">grams</span>
            </div>
          </div>
        </div>
      </div>
      <button onClick={() => onDelete(item.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors">
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  );
};
