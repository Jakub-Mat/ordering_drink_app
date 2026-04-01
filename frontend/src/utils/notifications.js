/**
 * Audio notification system for bartender's new orders
 */

// Simple beep sound using Web Audio API (no external assets needed)
export const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Notification sound: two quick beeps
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);

    // Second beep
    const oscillator2 = audioContext.createOscillator();
    oscillator2.connect(gainNode);
    oscillator2.frequency.value = 1000;
    oscillator2.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
    
    oscillator2.start(audioContext.currentTime + 0.15);
    oscillator2.stop(audioContext.currentTime + 0.25);
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

/**
 * Apply visual highlight animation to element
 * @param {HTMLElement} element - Element to highlight
 */
export const highlightElement = (element) => {
  if (!element) return;
  element.classList.add('pulse-highlight');
  setTimeout(() => {
    element.classList.remove('pulse-highlight');
  }, 1200);
};
