import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SleepContext = createContext();

export const SleepContextProvider = ({ children }) => {
  // --- Existing States for Sleep Alarm & Stats ---
  const [timerMode, setTimerMode] = useState('interval');
  const [timerDuration, setTimerDuration] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(30 * 60);
  const [alarmSound, setAlarmSound] = useState('default');
  const [targetTime, setTargetTime] = useState({ hour: 22, minute: 30 });
  const [repeatMode, setRepeatMode] = useState('once');
  const [sleepRecords, setSleepRecords] = useState([]);

  // --- 1. New States for Global Audio Stop Timer ---
  const [audioStopTimerDuration, setAudioStopTimerDuration] = useState(null); // in minutes
  const [audioStopRemainingTime, setAudioStopRemainingTime] = useState(null); // in seconds
  const stopAudioCallbacks = useRef(new Set()).current; // Use a Set to store callbacks
  const audioTimerRef = useRef(null); // Ref to hold the interval ID

  // --- 2. New Timer Logic for Audio Stop ---
  useEffect(() => {
    if (audioStopRemainingTime !== null && audioStopRemainingTime > 0) {
      audioTimerRef.current = setInterval(() => {
        setAudioStopRemainingTime(prev => {
          if (prev <= 1) {
            clearInterval(audioTimerRef.current);
            console.log('Global Audio Stop Timer finished. Stopping all audio.');
            stopAllAudio();
            setAudioStopTimerDuration(null);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } 
    return () => {
      if (audioTimerRef.current) clearInterval(audioTimerRef.current);
    };
  }, [audioStopRemainingTime]);

  // --- 3. New Functions for Global Audio Stop Timer ---
  const startAudioStopTimer = (minutes) => {
    console.log(`Starting global audio stop timer for ${minutes} minutes.`);
    if (audioTimerRef.current) clearInterval(audioTimerRef.current);
    setAudioStopTimerDuration(minutes);
    setAudioStopRemainingTime(minutes * 60);
  };

  const cancelAudioStopTimer = () => {
    console.log('Cancelling global audio stop timer.');
    if (audioTimerRef.current) clearInterval(audioTimerRef.current);
    setAudioStopTimerDuration(null);
    setAudioStopRemainingTime(null);
  };

  const stopAllAudio = () => {
    stopAudioCallbacks.forEach(callback => callback());
  };

  const onAudioShouldStop = useCallback((callback) => {
    stopAudioCallbacks.add(callback);
    return () => {
      stopAudioCallbacks.delete(callback);
    };
  }, [stopAudioCallbacks]);


  // --- Existing Logic ---
  const calculateTargetDate = () => {
    const now = new Date();
    const target = new Date();
    target.setHours(targetTime.hour, targetTime.minute, 0, 0);
    
    // If target time is earlier than current time, set it for next day
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }
    
    return target;
  };

  const calculateRemainingTime = () => {
    const target = calculateTargetDate();
    const now = new Date();
    const diff = target - now;
    return Math.max(0, Math.floor(diff / 1000));
  };

  const setTimer = (duration) => {
    setTimerDuration(duration);
    setRemainingTime(duration * 60);
  };

  const updateTimerMode = (mode) => {
    setTimerMode(mode);
  };

  const updateTimePoint = (time) => {
    setTargetTime(time);
  };

  const updateRepeatMode = (mode) => {
    setRepeatMode(mode);
  };

  const startTimer = () => {
    setIsTimerRunning(true);
    if (timerMode === 'interval') {
      setRemainingTime(timerDuration * 60);
    } else {
      setRemainingTime(calculateRemainingTime());
    }
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    if (timerMode === 'interval') {
      setRemainingTime(timerDuration * 60);
    } else {
      setRemainingTime(calculateRemainingTime());
    }
  };

  const setAlarmSoundPreference = (sound) => {
    setAlarmSound(sound);
  };

  const addSleepRecord = (record) => {
    const newRecord = { ...record, id: Date.now().toString() };
    setSleepRecords(prev => [...prev, newRecord]);
    saveSleepRecordsToStorage([...sleepRecords, newRecord]);
  };

  const updateSleepRecord = (id, updates) => {
    const updatedRecords = sleepRecords.map(record => 
      record.id === id ? { ...record, ...updates } : record
    );
    setSleepRecords(updatedRecords);
    saveSleepRecordsToStorage(updatedRecords);
  };

  const deleteSleepRecord = (id) => {
    const updatedRecords = sleepRecords.filter(record => record.id !== id);
    setSleepRecords(updatedRecords);
    saveSleepRecordsToStorage(updatedRecords);
  };

  const calculateSleepStats = () => {
    if (sleepRecords.length === 0) {
      return {
        averageSleepTime: 0,
        totalSleepDays: 0,
        thisWeekAverage: 0,
        bestStreak: 0,
        deepSleepPercentage: '85%',
        totalSleepRecords: 0,
        mostCommonBedtime: null,
        sleepQuality: 0
      };
    }

    const totalMinutes = sleepRecords.reduce((sum, record) => {
      if (record.duration) return sum + record.duration;
      return sum;
    }, 0);

    const averageMinutes = totalMinutes / sleepRecords.length;
    const averageHours = averageMinutes / 60;

    // Calculate this week's average
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekRecords = sleepRecords.filter(record => 
      new Date(record.date || record.createdAt) >= oneWeekAgo
    );
    
    const thisWeekMinutes = thisWeekRecords.reduce((sum, record) => {
      if (record.duration) return sum + record.duration;
      return sum;
    }, 0);
    const thisWeekAverage = thisWeekRecords.length > 0 ? (thisWeekMinutes / thisWeekRecords.length) / 60 : 0;

    return {
      averageSleepTime: averageHours,
      totalSleepDays: sleepRecords.length,
      thisWeekAverage: thisWeekAverage,
      bestStreak: Math.min(sleepRecords.length, 7), // Placeholder
      deepSleepPercentage: '85%', // Placeholder
      totalSleepRecords: sleepRecords.length,
      mostCommonBedtime: targetTime,
      sleepQuality: 75 // Placeholder calculation
    };
  };

  const saveSleepRecordsToStorage = async (records) => {
    try {
      await AsyncStorage.setItem('sleepRecords', JSON.stringify(records));
    } catch (error) {
      console.error('Error saving sleep records:', error);
    }
  };

  const loadSleepRecordsFromStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem('sleepRecords');
      if (stored) {
        setSleepRecords(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading sleep records:', error);
    }
  };

  // This effect is for the bed time alarm, not the audio stop timer. They are separate.
  useEffect(() => {
    let interval;
    if (isTimerRunning && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            // Trigger alarm or notification here
            console.log('Timer finished!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, remainingTime]);

  useEffect(() => {
    if (timerMode === 'countdown') {
      const updateRemainingTime = () => {
        setRemainingTime(calculateRemainingTime());
      };
      
      updateRemainingTime();
      const interval = setInterval(updateRemainingTime, 60000); // Update every minute
      
      return () => clearInterval(interval);
    }
  }, [timerMode, timerDuration, targetTime, repeatMode]);

  useEffect(() => {
    loadSleepRecordsFromStorage();
  }, []);

  return (
    <SleepContext.Provider
      value={{
        // Existing values...
        timerMode,
        timerDuration,
        isTimerRunning,
        remainingTime,
        alarmSound,
        targetTime,
        repeatMode,
        sleepRecords,
        setTimer,
        updateTimerMode,
        updateTimePoint,
        updateRepeatMode,
        startTimer,
        pauseTimer,
        resetTimer,
        setAlarmSoundPreference,
        addSleepRecord,
        updateSleepRecord,
        deleteSleepRecord,
        calculateSleepStats,

        // 4. Expose new values
        audioStopTimerDuration,
        audioStopRemainingTime,
        startAudioStopTimer,
        cancelAudioStopTimer,
        onAudioShouldStop,
      }}
    >
      {children}
    </SleepContext.Provider>
  );
};

export const useSleepContext = () => {
  const context = useContext(SleepContext);
  if (!context) {
    throw new Error('useSleepContext must be used within a SleepContextProvider');
  }
  return context;
};
