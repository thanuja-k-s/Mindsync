import React, { useState, useEffect } from 'react';
import './Reminders.css';

function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [activeAlarm, setActiveAlarm] = useState(null);
  const user = localStorage.getItem('user');

  useEffect(() => {
    if (!user) return;
    const remindersKey = `${user}_reminders`;
    const savedReminders = localStorage.getItem(remindersKey);
    if (savedReminders) setReminders(JSON.parse(savedReminders));
  }, [user]);

  // Check for due reminders every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      reminders.forEach(reminder => {
        if (!reminder.completed) {
          const reminderTime = new Date(reminder.date);
          const timeDiff = reminderTime - now;
          
          // Trigger alarm if within 1 minute window and not already alarming
          if (timeDiff > 0 && timeDiff < 60000 && activeAlarm?.id !== reminder.id) {
            setActiveAlarm(reminder);
            playAlarm();
            
            // Request browser notification permission
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('MindSync Reminder', {
                body: reminder.text,
                icon: '🔔',
                tag: `reminder-${reminder.id}`,
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
    // Create a simple beep sound using Web Audio API
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

  const addReminder = () => {
    if (newReminder.trim() && reminderDate) {
      const reminder = {
        id: Date.now(),
        text: newReminder,
        date: reminderDate,
        completed: false,
        createdAt: new Date().toISOString()
      };
      const updatedReminders = [...reminders, reminder];
      setReminders(updatedReminders);
      const remindersKey = `${user}_reminders`;
      localStorage.setItem(remindersKey, JSON.stringify(updatedReminders));
      setNewReminder('');
      setReminderDate('');
    }
  };

  const toggleReminder = (id) => {
    const updatedReminders = reminders.map(reminder =>
      reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder
    );
    setReminders(updatedReminders);
    const remindersKey = `${user}_reminders`;
    localStorage.setItem(remindersKey, JSON.stringify(updatedReminders));
    if (activeAlarm?.id === id) setActiveAlarm(null);
  };

  const deleteReminder = (id) => {
    const updatedReminders = reminders.filter(r => r.id !== id);
    setReminders(updatedReminders);
    const remindersKey = `${user}_reminders`;
    localStorage.setItem(remindersKey, JSON.stringify(updatedReminders));
    if (activeAlarm?.id === id) setActiveAlarm(null);
  };

  const dismissAlarm = () => {
    setActiveAlarm(null);
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  };

  return (
    <div className="reminders-page">
      <h1>⏰ Reminders</h1>

      {/* Active Alarm Popup */}
      {activeAlarm && (
        <div className="alarm-popup">
          <div className="alarm-content">
            <div className="alarm-icon">🔔</div>
            <h2>Reminder Alert!</h2>
            <p className="alarm-text">{activeAlarm.text}</p>
            <p className="alarm-time">
              Scheduled: {new Date(activeAlarm.date).toLocaleString()}
            </p>
            <div className="alarm-buttons">
              <button className="btn-dismiss" onClick={dismissAlarm}>Dismiss</button>
              <button className="btn-done" onClick={() => toggleReminder(activeAlarm.id)}>Mark Done</button>
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
              const isPast = new Date(reminder.date) < new Date();
              return (
                <div
                  key={reminder.id}
                  className={`reminder-item ${reminder.completed ? 'completed' : ''} ${isPast && !reminder.completed ? 'overdue' : ''}`}
                >
                  <div className="reminder-check">
                    <input
                      type="checkbox"
                      checked={reminder.completed}
                      onChange={() => toggleReminder(reminder.id)}
                    />
                  </div>
                  <div className="reminder-info">
                    <p className="reminder-desc">{reminder.text}</p>
                    <p className="reminder-time">
                      {new Date(reminder.date).toLocaleString()}
                      {isPast && !reminder.completed && <span className="overdue-badge">OVERDUE</span>}
                    </p>
                  </div>
                  <button
                    className="btn-delete"
                    onClick={() => deleteReminder(reminder.id)}
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
