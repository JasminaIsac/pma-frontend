import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import type { Task } from 'schemas';
import { DayCard } from './DayCard';

interface DaysCarouselProps {
  tasks: Task[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

export const DaysCarousel: React.FC<DaysCarouselProps> = ({ tasks, selectedDate, setSelectedDate }) => {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.daysContent}
      style={styles.daysScroll}
    >
      {days.map((day, index) => {
        const dayString = day.toISOString().split('T')[0];
        return (
          <DayCard
            key={index}
            day={day}
            tasks={tasks}
            isSelected={selectedDate === dayString}
            onPress={() => setSelectedDate(dayString)}
          />
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  daysScroll: {
    marginVertical: 10,
  },
  daysContent: {
    paddingHorizontal: 10,
  },
});