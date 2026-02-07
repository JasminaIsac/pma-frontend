export const getMotivationalMessage = (percentage: number, hasTasks: boolean) => {
  if (!hasTasks) {
    return {
      title: 'No tasks for today!',
      subtitle: 'Enjoy your free time!',
    };
  }

  const messages = {
    0: {
      title: 'Time to start your daily tasks!',
      subtitle: "Let's get started! Your tasks are waiting!",
    },
    30: {
      title: "Good Start! You're making progress!",
      subtitle: "Keep going! You've got this!",
    },
    75: {
      title: 'Halfway there! Keep up the good work!',
      subtitle: "Keep going! You've got this!",
    },
    90: {
      title: 'Almost done! Keep pushing!',
      subtitle: "Keep going! You've got this!",
    },
    100: {
      title: 'Congratulations! All tasks are completed!',
      subtitle: 'Great job! Take a break!',
    },
  };

  if (percentage === 0) return messages[0];
  if (percentage <= 30) return messages[30];
  if (percentage < 75) return messages[75];
  if (percentage < 100) return messages[90];
  return messages[100];
};