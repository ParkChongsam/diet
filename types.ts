
export interface FoodItem {
  id: string; // Temporary client-side ID for list keys
  foodName: string;
  calories: number;
  servingSizeGrams: number;
}

export interface DailyIntake {
  date: string; // YYYY-MM-DD format
  total_kcal: number;
}
