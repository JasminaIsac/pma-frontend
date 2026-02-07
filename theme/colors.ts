import { TaskPriority, TaskStatus, UserStatus } from "schemas";

export const colors = {
  // Culori primare
  darkBlue: '#283271',
  mediumBlue: '#4579FB',
  lightBlue: '#A3C6FF',
  violetBlueGradient: ['#4C256D', '#4579FB'] as const,
  darkOrange: '#E76F13',
  mediumOrange: '#FF8C00',
  lightOrange: '#FFD0AC',
  orangeGradient: ['#FFA058', '#E76F13'] as const,
  white: '#FFFFFF',
  
  // Culori de background
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F6FA',
    accentBlue: '#D5E1FF',
    accentOrange: '#FFD0AC',
    disabled: '#E9ECEF',
    error: '#FFF2F0',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Culori pentru text
  text: {
    primary: '#141620',
    secondary: '#666666',
    error: '#FF4D4F',
    accentBlue: '#4579FB',
    accentOrange: '#FF8C00',
    disabled: '#A3A3A3',
  },
  
  // Culori pentru status
  status: {
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#FF4D4F',
    info: '#2196F3',
  },
  
  // Culori pentru border și separatori
  border: {
    primary: '#cddaf0',
    focused: '#82b2ff',
    error: '#FF4D4F',
    outline: '#FFFFFF',
  },
  
  // Culori pentru tab bar și navigație
  navigation: {
    active: '#4579FB',
    inactive: '#8C8C8C',
    background: '#FFFFFF',
  },

  // Culori pentru shadow
  shadow: {
    primary: '#000000',
  },

  // Culori pentru butoane
  button: {
    primary: '#4579FB',
    secondary: '#9ba0a9',
    disabled: '#E9ECEF',
    delete: '#f9245b',
    outline: 'transparent',
  },

  // Culori pentru mesaje
  message: {
    primary: '#d6e5ff',
    secondary: '#fff',
  },

   // Culori pentru priorități task
   priority: {
    [TaskPriority.HIGH]: { label: 'High', color: '#e74c3c' },
    [TaskPriority.MEDIUM]: { label: 'Medium', color: '#f1c40f' },
    [TaskPriority.LOW]: { label: 'Low', color: '#2ecc71' },
  },
  
  // Culori pentru statusuri task
  taskStatus: {
    [TaskStatus.NEW]: { color: '#e224f9', label: 'New' },
    [TaskStatus.IN_PROGRESS]: { color: '#4579FB', label: 'In Progress' },
    [TaskStatus.PAUSED]: { color: '#e5c01b', label: 'Paused' },
    [TaskStatus.TO_CHECK]: { color: '#88cf1b', label: 'To Check' },
    [TaskStatus.COMPLETED]: { color: '#009a28', label: 'Completed' },
    [TaskStatus.RETURNED]: { color: '#f9245b', label: 'Returned' },
  },

  userStatus: {
    [UserStatus.ACTIVE]: { color: '#009a28', label: 'Active' },
    [UserStatus.INACTIVE]: { color: '#f0d700', label: 'Inactive' },
    [UserStatus.BANNED]: { color: '#f9245b', label: 'Banned' },
    [UserStatus.DELETED]: { color: '#6c757d', label: 'Deleted' },
  },
}; 