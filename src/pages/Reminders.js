import React, { useState, useEffect } from 'react';
import './Reminders.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderPriority, setReminderPriority] = useState('medium');
  const [activeAlarm, setActiveAlarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');
  const authToken = localStorage.getItem('authToken');

  // Fetch reminders from backend
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    const fetchReminders = async () => {
      try {
        const response = await fetch(`${API_URL}/api/reminders/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setReminders(data);
        } else {
          console.error('Failed to fetch reminders');
        }
      } catch (err) {
        console.error('Error fetching reminders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, [userId, authToken]);

  // Check for due reminders every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      reminders.forEach(reminder => {
        if (!reminder.completed) {
          const reminderTime = new Date(reminder.dueDate);
          const timeDiff = reminderTime - now;
          
          // Trigger alarm if within 1 minute window and not already alarming
          if (timeDiff > 0 && timeDiff < 60000 && activeAlarm?._id !== reminder._id) {
            setActiveAlarm(reminder);
            playAlarm();
            
            // Request browser notification permission
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('MindSync Reminder', {
                body: reminder.title,
                icon: '🔔',
                tag: `reminder-${reminder._id}`,
                requireInteraction: true
              });
            }
          }
        }
      });
    }, 10000);
    
    return () => clearInterval(interval);
  }, [reminders, activeAlarm]);

  const playAlarm = () => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    
    oscillator.connect(gain);
    gain.connect(context.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gain.gain.setValueAtTime(0.3, context.currentTime);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.2);
  };

  const addReminder = async () => {
    if (!newReminder.trim() || !reminderDate) {
      alert('Please enter reminder text and date');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/reminders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          userId,
          title: newReminder,
          dueDate: reminderDate,
          priority: reminderPriority,
          completed: false
        })
      });

      if (response.ok) {
        const reminder = await response.json();
        setReminders([...reminders, reminder]);
        setNewReminder('');
        setReminderDate('');
        setReminderPriority('medium');
      } else {
        console.error('Failed to add reminder');
        alert('Failed to add reminder');
      }
    } catch (err) {
      console.error('Error adding reminder:', err);
      alert('Error adding reminder');
    }
  };

  const toggleReminder = async (id) => {
    try {
      const reminder = reminders.find(r => r._id === id);
      if (!reminder) return;

      const response = await fetch(`${API_URL}/api/reminders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          completed: !reminder.completed
        })
      });

      if (response.ok) {
        const updated = await response.json();
        setReminders(reminders.map(r => r._id === id ? updated : r));
        if (activeAlarm?._id === id) setActiveAlarm(null);
      } else {
        console.error('Failed to update reminder');
      }
    } catch (err) {
      console.error('Error updating reminder:', err);
    }
  };

  const deleteReminder = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/reminders/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        setReminders(reminders.filter(r => r._id !== id));
        if (activeAlarm?._id === id) setActiveAlarm(null);
      } else {
        console.error('Failed to delete reminder');
      }
    } catch (err) {
      console.error('Error deleting reminder:', err);
    }
  };

  const dismissAlarm = () => {
    setActiveAlarm(null);
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  };

  if (loading) {
    return (
      <div className="reminders-page">
        <h1>⏰ Reminders</h1>
        <p style={{ textAlign: 'center', color: '#9ca3af' }}>Loading reminders...</p>
      </div>
    );
  }

  return (
    <div className="reminders-page">
      <h1>⏰ Reminders</h1>

      {/* Active Alarm Popup */}
      {activeAlarm && (
        <div className="alarm-popup">
          <div className="alarm-content">
            <div className="alarm-icon">🔔</div>
            <h2>Reminder Alert!</h2>
            <p className="alarm-text">{activeAlarm.title}</p>
            <p className="alarm-time">
              Scheduled: {new Date(activeAlarm.dueDate).toLocaleString()}
            </p>
            <div className="alarm-buttons">
              <button className="btn-dismiss" onClick={dismissAlarm}>Dismiss</button>
              <button className="btn-done" onClick={() => toggleReminder(activeAlarm._id)}>Mark Done</button>
            </div>
          </div>
        </div>
      )}

      <div className="reminders-section">
        <h2>Add New Reminder</h2>
        <div className="add-reminder">
          <textarea
            className="reminder-text"
            value={newReminder}
            onChange={(e) => setNewReminder(e.target.value)}
            placeholder="What do you need to be reminded about? (e.g., Take medication, Drink water, Call mom)"
            rows={4}
          />
          <div className="reminder-controls">
            <input
              type="datetime-local"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
            />
            <select
              value={reminderPriority}
              onChange={(e) => setReminderPriority(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(0, 0, 0, 0.3)',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <button className="btn-add" onClick={addReminder}>Add Reminder</button>
            <button className="btn-notify" onClick={requestNotificationPermission}>
              Enable Notifications
            </button>
          </div>
        </div>

        <h2>Your Reminders</h2>
        <div className="reminders-list">
          {reminders.length === 0 ? (
            <p className="empty">No reminders yet. Add one to stay on track!</p>
          ) : (
            reminders.map(reminder => {
              const isPast = new Date(reminder.dueDate) < new Date();
              return (
                <div
                  key={reminder._id}
                  className={`reminder-item ${reminder.completed ? 'completed' : ''} ${isPast && !reminder.completed ? 'overdue' : ''}`}
                >
                  <div className="reminder-check">
                    <input
                      type="checkbox"
                      checked={reminder.completed}
                      onChange={() => toggleReminder(reminder._id)}
                    />
                  </div>
                  <div className="reminder-info">
                    <p className="reminder-desc">{reminder.title}</p>
                    <p className="reminder-time">
                      {new Date(reminder.dueDate).toLocaleString()}
                      {isPast && !reminder.completed && <span className="overdue-badge">OVERDUE</span>}
                      <span style={{
                        marginLeft: '12px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        backgroundColor: reminder.priority === 'high' ? 'rgba(239, 68, 68, 0.3)' : 
                                        reminder.priority === 'low' ? 'rgba(34, 197, 94, 0.3)' : 
                                        'rgba(249, 115, 22, 0.3)',
                        color: reminder.priority === 'high' ? '#fca5a5' : 
                               reminder.priority === 'low' ? '#86efac' : 
                               '#fed7aa'
                      }}>
                        {reminder.priority?.toUpperCase()}
                      </span>
                    </p>
                  </div>
                  <button
                    className="btn-delete"
                    onClick={() => deleteReminder(reminder._id)}
                    aria-label="Delete reminder"
                  >
                    ✕
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Reminders;
