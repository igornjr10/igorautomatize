
import React, { useState, useEffect, useRef } from 'react';
import { Habit, Task, Transaction, Workout } from './types';
import Dashboard from './components/Dashboard';
import HabitsModule from './components/HabitsModule';
import FinanceModule from './components/FinanceModule';
import TrainingModule from './components/TrainingModule';
import GeminiChat from './components/GeminiChat';
import Onboarding from './components/Onboarding';
import Sidebar from './components/Sidebar';
import LiveAssistant from './components/LiveAssistant';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'habits' | 'finance' | 'training' | 'ai'>('dashboard');
  const [onboardingCompleted, setOnboardingCompleted] = useState(() => {
    return localStorage.getItem('onboarding_done') === 'true';
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('habits');
    return saved ? JSON.parse(saved) : [];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    const saved = localStorage.getItem('workouts');
    return saved ? JSON.parse(saved) : [];
  });

  const lastTriggeredReminders = useRef<Set<string>>(new Set());

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('workouts', JSON.stringify(workouts));
    localStorage.setItem('onboarding_done', String(onboardingCompleted));
  }, [habits, tasks, transactions, workouts, onboardingCompleted]);

  // Permissão de Notificação com fallback
  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    const checkReminders = () => {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

      const now = new Date();
      const currentHHMM = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const todayKey = now.toDateString();

      habits.forEach(h => {
        const uniqueId = `habit-${h.id}-${todayKey}-${currentHHMM}`;
        if (h.reminderTime === currentHHMM && !h.completedToday && !lastTriggeredReminders.current.has(uniqueId)) {
          new Notification('Hábito Pendente! 🚀', {
            body: `Está na hora de: ${h.name}.`,
          });
          lastTriggeredReminders.current.add(uniqueId);
        }
      });

      tasks.forEach(t => {
        const uniqueId = `task-${t.id}-${todayKey}-${currentHHMM}`;
        if (t.reminderTime === currentHHMM && !t.completed && !lastTriggeredReminders.current.has(uniqueId)) {
          new Notification('Lembrete de Tarefa 📋', {
            body: `Tarefa: "${t.title}"`,
          });
          lastTriggeredReminders.current.add(uniqueId);
        }
      });

      if (lastTriggeredReminders.current.size > 200) {
        lastTriggeredReminders.current.clear();
      }
    };

    const interval = setInterval(checkReminders, 15000); 
    return () => clearInterval(interval);
  }, [habits, tasks]);

  const handleCompleteOnboarding = (initialHabits: Habit[]) => {
    setHabits(initialHabits);
    setOnboardingCompleted(true);
  };

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newT = { ...t, id: Math.random().toString(36).substr(2, 9) };
    setTransactions([newT, ...transactions]);
  };

  const toggleHabit = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        return { 
          ...h, 
          completedToday: !h.completedToday,
          streak: !h.completedToday ? h.streak + 1 : Math.max(0, h.streak - 1)
        };
      }
      return h;
    }));
  };

  if (!onboardingCompleted) {
    return <Onboarding onComplete={handleCompleteOnboarding} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
          habits={habits} transactions={transactions} tasks={tasks} workouts={workouts}
          onQuickAction={setActiveTab}
        />;
      case 'habits':
        return <HabitsModule habits={habits} tasks={tasks} toggleHabit={toggleHabit} setHabits={setHabits} setTasks={setTasks} />;
      case 'finance':
        return <FinanceModule transactions={transactions} addTransaction={addTransaction} />;
      case 'training':
        return <TrainingModule workouts={workouts} onAddWorkout={(w) => setWorkouts([w, ...workouts])} />;
      case 'ai':
        return <GeminiChat data={{ habits, transactions, tasks, workouts }} />;
      default:
        return <Dashboard habits={habits} transactions={transactions} tasks={tasks} workouts={workouts} onQuickAction={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden font-inter text-gray-200">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto relative transition-all duration-500 custom-scrollbar">
        <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-6xl mx-auto p-4 md:p-12 pb-32 md:pb-12">
          {renderContent()}
        </div>
      </main>
      <LiveAssistant />
      <nav className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-2xl border-t border-white/5 md:hidden flex justify-around p-5 z-[90]">
        {[
          { id: 'dashboard', icon: '🏠', label: 'Início' },
          { id: 'habits', icon: '✅', label: 'Hábitos' },
          { id: 'finance', icon: '💰', label: 'Finanças' },
          { id: 'ai', icon: '✨', label: 'IA' }
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id as any)} 
            className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === item.id ? 'text-indigo-400 scale-110' : 'text-gray-500'}`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
