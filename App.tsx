
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { RecognitionResult } from './components/RecognitionResult';
import { HistoryDashboard } from './components/HistoryDashboard';
import { Toast, ToastMessage } from './components/Toast';
import { SettingsModal } from './components/SettingsModal';
import { analyzeImageForFood } from './services/geminiService';
import type { FoodItem, DailyIntake } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { getTodayDateString } from './utils/dateUtils';
import { LoadingSpinner } from './components/icons/LoadingSpinner';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recognizedFoodItems, setRecognizedFoodItems] = useState<FoodItem[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [dailyGoal, setDailyGoal] = useLocalStorage<number>('calorieTracker:goal', 2000);
  const [history, setHistory] = useLocalStorage<DailyIntake[]>('calorieTracker:history', []);
  const [dailyTotal, setDailyTotal] = useState<number>(0);

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  useEffect(() => {
    const today = getTodayDateString();
    const todayIntake = history.find(item => item.date === today);
    setDailyTotal(todayIntake?.total_kcal || 0);

    // If there is no goal set, open settings on first visit.
    const goalIsSet = localStorage.getItem('calorieTracker:goal');
    if (!goalIsSet) {
      setIsSettingsOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnalysis = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setRecognizedFoodItems([]);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Image = (reader.result as string).split(',')[1];
        if (!base64Image) {
          throw new Error('Failed to read image file.');
        }
        
        setImagePreview(reader.result as string);
        const items = await analyzeImageForFood(base64Image);
        
        // Add a temporary unique ID for React keys
        const itemsWithId = items.map(item => ({...item, id: crypto.randomUUID() }));
        setRecognizedFoodItems(itemsWithId);

      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
        setToast({ type: 'error', message: 'Failed to analyze image. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
        setIsLoading(false);
        setError('Failed to read file.');
        setToast({ type: 'error', message: 'Could not read the image file.' });
    };
  };

  const handleSaveMeal = (mealItems: FoodItem[]) => {
    const mealTotal = mealItems.reduce((sum, item) => sum + item.calories, 0);
    const newDailyTotal = dailyTotal + mealTotal;
    
    const goalReachedBefore = dailyTotal >= dailyGoal;
    const goalReachedAfter = newDailyTotal >= dailyGoal;

    if (!goalReachedBefore && goalReachedAfter) {
       setToast({ type: 'success', message: `Goal of ${dailyGoal} kcal reached!` });
    } else if (dailyTotal < dailyGoal && newDailyTotal > dailyGoal) {
        setToast({ type: 'warning', message: `You've exceeded your daily goal!` });
    }

    setDailyTotal(newDailyTotal);

    const today = getTodayDateString();
    const updatedHistory = history.filter(item => item.date !== today);
    setHistory([...updatedHistory, { date: today, total_kcal: newDailyTotal }]);
    
    handleClearRecognition();
  };

  const handleClearRecognition = () => {
    setRecognizedFoodItems([]);
    setImagePreview(null);
    setError(null);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Header 
        dailyTotal={dailyTotal} 
        dailyGoal={dailyGoal} 
        onSettingsClick={() => setIsSettingsOpen(true)}
      />
      <main className="container mx-auto p-4 md:p-8 max-w-5xl">
        <div className="space-y-8">
          {recognizedFoodItems.length === 0 && !isLoading && (
            <ImageUploader onUpload={handleAnalysis} />
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl shadow-lg border border-gray-200 text-center">
              <LoadingSpinner className="w-16 h-16 text-brand-primary mb-6" />
              <h2 className="text-2xl font-bold text-gray-700">Analyzing your meal...</h2>
              <p className="text-gray-500 mt-2">Our AI is identifying food items and estimating calories. This may take a moment.</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-center">
              <h3 className="text-xl font-semibold text-red-700">Analysis Failed</h3>
              <p className="text-red-600 mt-2">{error}</p>
              <button
                onClick={handleClearRecognition}
                className="mt-4 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
          
          {recognizedFoodItems.length > 0 && !isLoading && (
            <RecognitionResult 
              items={recognizedFoodItems}
              setItems={setRecognizedFoodItems}
              onSave={handleSaveMeal}
              onCancel={handleClearRecognition}
              imagePreview={imagePreview}
            />
          )}

          <HistoryDashboard history={history} goal={dailyGoal} />
        </div>
      </main>

      {isSettingsOpen && (
        <SettingsModal 
          currentGoal={dailyGoal} 
          onSave={(newGoal) => {
            setDailyGoal(newGoal);
            setIsSettingsOpen(false);
            setToast({ type: 'success', message: 'Daily goal updated successfully!' });
          }} 
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default App;
