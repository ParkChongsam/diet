
import React from 'react';
import type { DailyIntake } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getTodayDateString } from '../utils/dateUtils';

interface HistoryDashboardProps {
  history: DailyIntake[];
  goal: number;
}

const getLast7DaysData = (history: DailyIntake[], goal: number) => {
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        const historyItem = history.find(h => h.date === dateString);
        data.push({
            name: date.toLocaleDateString('ko-KR', { weekday: 'short' }),
            date: dateString,
            kcal: historyItem?.total_kcal || 0,
            goal: goal
        });
    }
    return data;
};

export const HistoryDashboard: React.FC<HistoryDashboardProps> = ({ history, goal }) => {
  const chartData = getLast7DaysData(history, goal);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
          <p className="font-bold text-gray-800">{label}</p>
          <p className="text-brand-primary">{`섭취량: ${data.kcal.toLocaleString()} kcal`}</p>
          <p className="text-gray-500">{`목표: ${data.goal.toLocaleString()} kcal`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">주간 요약</h2>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
            <YAxis tick={{ fill: '#6b7280' }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(209, 250, 229, 0.5)' }}/>
            <Bar dataKey="kcal" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.kcal > goal ? '#ef4444' : '#10b981'} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};