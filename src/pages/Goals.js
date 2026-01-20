import React, { useState, useEffect } from 'react';
import './Goals.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function Goals() {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalCategory, setGoalCategory] = useState('personal');
  const [goalTargetDate, setGoalTargetDate] = useState('');
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    fetchGoals();
  }, [userId]);

  const fetchGoals = async () => {
    try {
      const response = await fetch(`${API_URL}/api/goals/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      } else {
        console.error('Failed to fetch goals');
      }
    } catch (err) {
      console.error('Error fetching goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async () => {
    if (!newGoal.trim()) return;

    try {
      const goalData = {
        userId,
        title: newGoal,
        description: goalDescription,
        category: goalCategory,
        targetDate: goalTargetDate || null,
        progress: 0,
        status: 'active'
      };

      const response = await fetch(`${API_URL}/api/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(goalData)
      });

      if (response.ok) {
        const newGoalData = await response.json();
        setGoals([...goals, newGoalData]);
        setNewGoal('');
        setGoalDescription('');
        setGoalCategory('personal');
        setGoalTargetDate('');
      } else {
        alert('Failed to add goal');
      }
    } catch (err) {
      console.error('Error adding goal:', err);
      alert('Error adding goal. Make sure backend is running.');
    }
  };



  const updateProgress = async (id, newProgress) => {
    try {
      const response = await fetch(`${API_URL}/api/goals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ progress: Math.min(100, Math.max(0, newProgress)) })
      });

      if (response.ok) {
        const updatedGoal = await response.json();
        setGoals(goals.map(g => g._id === id ? updatedGoal : g));
      }
    } catch (err) {
      console.error('Error updating goal progress:', err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/goals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const updatedGoal = await response.json();
        setGoals(goals.map(g => g._id === id ? updatedGoal : g));
      }
    } catch (err) {
      console.error('Error updating goal status:', err);
    }
  };

  const deleteGoal = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/goals/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        setGoals(goals.filter(g => g._id !== id));
      }
    } catch (err) {
      console.error('Error deleting goal:', err);
    }
  };



  return (
    <div className="goals-page">
      <h1>🎯 Goals & Habits</h1>

      {/* Add New Goal Section */}
      <div className="goals-section">
        <h2>Add New Goal</h2>
        <div className="add-goal-form">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="What's your goal? (e.g., Read 30 minutes daily, Exercise 3x/week)"
            className="goal-title-input"
          />
          <textarea
            value={goalDescription}
            onChange={(e) => setGoalDescription(e.target.value)}
            placeholder="Describe your goal... (optional)"
            rows={3}
            className="goal-description-input"
          />
          <div className="goal-controls">
            <select value={goalCategory} onChange={(e) => setGoalCategory(e.target.value)} className="goal-category-select">
              <option value="health">Health</option>
              <option value="career">Career</option>
              <option value="personal">Personal</option>
              <option value="finance">Finance</option>
              <option value="education">Education</option>
              <option value="other">Other</option>
            </select>
            <input
              type="date"
              value={goalTargetDate}
              onChange={(e) => setGoalTargetDate(e.target.value)}
              className="goal-date-input"
            />
            <button className="btn-add-goal" onClick={addGoal}>Add Goal</button>
          </div>
        </div>
      </div>

      {/* Goals List Section */}
      <div className="goals-list-section">
        <h2>Your Goals</h2>
        {loading ? (
          <p>Loading goals...</p>
        ) : goals.length === 0 ? (
          <p className="muted">No goals yet. Add one to get started! 🚀</p>
        ) : (
          <div className="goals-grid">
            {goals.map(goal => (
              <div key={goal._id} className="goal-card">
                <div className="goal-header">
                  <h3>{goal.title}</h3>
                  <span className={`goal-status ${goal.status}`}>{goal.status}</span>
                </div>
                
                {goal.description && <p className="goal-description">{goal.description}</p>}
                
                <div className="goal-category-badge">{goal.category}</div>
                
                <div className="goal-progress">
                  <div className="progress-label">
                    <span>Progress</span>
                    <span className="progress-value">{goal.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: `${goal.progress}%`}}></div>
                  </div>
                </div>

                <div className="goal-input">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={goal.progress}
                    onChange={(e) => updateProgress(goal._id, parseInt(e.target.value))}
                    className="progress-slider"
                  />
                </div>

                {goal.targetDate && (
                  <p className="goal-target">
                    Target: {new Date(goal.targetDate).toLocaleDateString()}
                  </p>
                )}

                <div className="goal-actions">
                  {goal.status === 'active' && (
                    <button className="btn-complete" onClick={() => updateStatus(goal._id, 'completed')}>
                      Mark Complete
                    </button>
                  )}
                  {goal.status === 'completed' && (
                    <button className="btn-reactivate" onClick={() => updateStatus(goal._id, 'active')}>
                      Reactivate
                    </button>
                  )}
                  <button className="btn-delete" onClick={() => deleteGoal(goal._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Goals;
