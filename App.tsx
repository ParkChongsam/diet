
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
          throw new Error('이미지 파일을 읽는데 실패했습니다.');
        }
        
        setImagePreview(reader.result as string);
        const items = await analyzeImageForFood(base64Image);
        
        // Add a temporary unique ID for React keys
        const itemsWithId = items.map(item => ({...item, id: crypto.randomUUID() }));
        setRecognizedFoodItems(itemsWithId);

      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : '분석 중 알 수 없는 오류가 발생했습니다.');
        setToast({ type: 'error', message: '이미지 분석에 실패했습니다. 다시 시도해주세요.' });
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
        setIsLoading(false);
        setError('파일을 읽는데 실패했습니다.');
        setToast({ type: 'error', message: '이미지 파일을 읽을 수 없습니다.' });
    };
  };

  const handleSaveMeal = (mealItems: FoodItem[]) => {
    const mealTotal = mealItems.reduce((sum, item) => sum + item.calories, 0);
    const newDailyTotal = dailyTotal + mealTotal;
    
    const goalReachedBefore = dailyTotal >= dailyGoal;
    const goalReachedAfter = newDailyTotal >= dailyGoal;

    if (!goalReachedBefore && goalReachedAfter) {
       setToast({ type: 'success', message: `목표 ${dailyGoal}kcal를 달성했습니다!` });
    } else if (dailyTotal < dailyGoal && newDailyTotal > dailyGoal) {
        setToast({ type: 'warning', message: `일일 목표를 초과했습니다!` });
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
              <h2 className="text-2xl font-bold text-gray-700">식사를 분석하고 있어요...</h2>
              <p className="text-gray-500 mt-2">AI가 음식 항목을 식별하고 칼로리를 추정하고 있습니다. 잠시만 기다려주세요.</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-center">
              <h3 className="text-xl font-semibold text-red-700">분석 실패</h3>
              <p className="text-red-600 mt-2">{error}</p>
              <button
                onClick={handleClearRecognition}
                className="mt-4 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                다시 시도
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
            setToast({ type: 'success', message: '일일 목표가 성공적으로 업데이트되었습니다!' });
          }} 
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default App;