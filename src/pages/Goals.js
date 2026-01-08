import React, { useState, useEffect } from 'react';
import './Goals.css';

function Goals() {
  const [goals, setGoals] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [newReminder, setNewReminder] = useState('');
  const [reminderDate, setReminderDate] = useState('');

  useEffect(() => {
    const savedGoals = localStorage.getItem('goals');
    const savedReminders = localStorage.getItem('reminders');
    if (savedGoals) {
      const parsedGoals = JSON.parse(savedGoals);
      const updatedGoals = parsedGoals.map(goal => ({
        ...goal,
        lastCompleted: goal.lastCompleted || null
      }));
      setGoals(updatedGoals);
      localStorage.setItem('goals', JSON.stringify(updatedGoals));
    }
    if (savedReminders) setReminders(JSON.parse(savedReminders));
  }, []);

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
      localStorage.setItem('goals', JSON.stringify(updatedGoals));
      setNewGoal('');
    }
  };

  const addReminder = () => {
    if (newReminder.trim() && reminderDate) {
      const reminder = {
        id: Date.now(),
        text: newReminder,
        date: reminderDate,
        completed: false
      };
      const updatedReminders = [...reminders, reminder];
      setReminders(updatedReminders);
      localStorage.setItem('reminders', JSON.stringify(updatedReminders));
      setNewReminder('');
      setReminderDate('');
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
    localStorage.setItem('goals', JSON.stringify(updatedGoals));
  };

  const toggleReminder = (id) => {
    const updatedReminders = reminders.map(reminder =>
      reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder
    );
    setReminders(updatedReminders);
    localStorage.setItem('reminders', JSON.stringify(updatedReminders));
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

      <div className="reminders-section">
        <h2>Reminders</h2>
        <div className="add-reminder">
          <textarea
            className="reminder-text"
            value={newReminder}
            onChange={(e) => setNewReminder(e.target.value)}
            placeholder="Describe your reminder (details, steps, notes)..."
            rows={4}
          />
          <div className="reminder-controls">
            <input
              type="datetime-local"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
            />
            <button onClick={addReminder}>Add Reminder</button>
          </div>
        </div>

        <div className="reminders-list">
          {reminders.map(reminder => (
            <div key={reminder.id} className={`reminder-item ${reminder.completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={reminder.completed}
                onChange={() => toggleReminder(reminder.id)}
              />
              <span style={{flex:1}}>{reminder.text}</span>
              <span>{new Date(reminder.date).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Goals;
