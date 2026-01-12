import React, { useState, useEffect } from 'react';
import './Goals.css';

function Goals() {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const user = localStorage.getItem('user');

  useEffect(() => {
    if (!user) return;
    
    const goalsKey = `${user}_goals`;
    
    const savedGoals = localStorage.getItem(goalsKey);
    
    if (savedGoals) {
      const parsedGoals = JSON.parse(savedGoals);
      const updatedGoals = parsedGoals.map(goal => ({
        ...goal,
        lastCompleted: goal.lastCompleted || null
      }));
      setGoals(updatedGoals);
      localStorage.setItem(goalsKey, JSON.stringify(updatedGoals));
    }
  }, [user]);

  const addGoal = () => {
    if (newGoal.trim()) {
      const goal = {
        id: Date.now(),
        text: newGoal,
        progress: 0,
        streak: 0,
        lastCompleted: null,
        createdAt: new Date().toISOString()
      };
      const updatedGoals = [...goals, goal];
      setGoals(updatedGoals);
      const goalsKey = `${user}_goals`;
      localStorage.setItem(goalsKey, JSON.stringify(updatedGoals));
      setNewGoal('');
    }
  };



  const updateProgress = (id, progress) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === id) {
        const newProgress = Math.min(100, Math.max(0, progress));
        const today = new Date().toDateString();
        let newStreak = goal.streak;
        let newLastCompleted = goal.lastCompleted;

        if (newProgress > 0) {
          if (!goal.lastCompleted || new Date(goal.lastCompleted).toDateString() !== today) {
            // New day
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();

            if (goal.lastCompleted === yesterdayStr) {
              newStreak = goal.streak + 1;
            } else {
              newStreak = 1;
            }
            newLastCompleted = today;
          }
          // If same day, keep streak as is
        }

        return { ...goal, progress: newProgress, streak: newStreak, lastCompleted: newLastCompleted };
      }
      return goal;
    });
    setGoals(updatedGoals);
    const goalsKey = `${user}_goals`;
    localStorage.setItem(goalsKey, JSON.stringify(updatedGoals));
  };



  return (
    <div className="goals-container">
      <h1>Goals & Habits</h1>

      <div className="goals-section">
        <h2>Your Goals</h2>
        <div className="add-goal">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Enter a new goal..."
          />
          <button onClick={addGoal}>Add Goal</button>
        </div>

        <div className="goals-list">
          {goals.map(goal => (
            <div key={goal.id} className="goal-item">
              <h3>{goal.text}</h3>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                value={goal.progress}
                onChange={(e) => updateProgress(goal.id, parseInt(e.target.value))}
                placeholder="Progress %"
              />
              <p>Streak: {goal.streak} days</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Goals;
