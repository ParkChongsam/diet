
import React from 'react';
import type { FoodItem } from '../types';
import { FoodItemCard } from './FoodItemCard';

interface RecognitionResultProps {
  items: FoodItem[];
  setItems: React.Dispatch<React.SetStateAction<FoodItem[]>>;
  onSave: (items: FoodItem[]) => void;
  onCancel: () => void;
  imagePreview: string | null;
}

export const RecognitionResult: React.FC<RecognitionResultProps> = ({ items, setItems, onSave, onCancel, imagePreview }) => {
  const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);

  const handleItemChange = (updatedItem: FoodItem) => {
    setItems(currentItems => currentItems.map(item => item.id === updatedItem.id ? updatedItem : item));
  };
  
  const handleItemDelete = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Analysis Complete</h2>
            <p className="text-gray-500 mt-1">Review the items found in your photo. Adjust if needed.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 p-6">
            <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
                {imagePreview && (
                    <img src={imagePreview} alt="Uploaded meal" className="max-h-96 w-auto object-contain" />
                )}
            </div>
            <div className="space-y-4">
                 {items.length > 0 ? (
                    items.map(item => (
                        <FoodItemCard 
                            key={item.id}
                            item={item}
                            onChange={handleItemChange}
                            onDelete={handleItemDelete}
                        />
                    ))
                 ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No food items were detected or the list is empty.</p>
                    </div>
                 )}
            </div>
        </div>
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-xl font-bold text-gray-800">
                Total Meal Calories: <span className="text-brand-primary">{Math.round(totalCalories)} kcal</span>
            </div>
            <div className="flex items-center space-x-3">
                <button
                    onClick={onCancel}
                    className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={() => onSave(items)}
                    disabled={items.length === 0}
                    className="px-8 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    Save to Daily Log
                </button>
            </div>
        </div>
    </div>
  );
};
