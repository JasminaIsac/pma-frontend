import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import CircularProgress from 'react-native-circular-progress-indicator';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { textPresets, colors } from '@theme/index';
import { useTodayTasks } from '@hooks/useTodayTasks';
import { getMotivationalMessage } from '@utils/index';

export const TodayProgress = () => {
  const router = useRouter();
  const { todayTasks, percentage } = useTodayTasks();
  const { title, subtitle } = getMotivationalMessage( percentage, todayTasks.length > 0 );
  const handleNavigate = (): void => router.push('/(tabs)/(dashboard)/(tasks)');

  return (
    <LinearGradient
      colors={colors.violetBlueGradient}
      style={styles.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={styles.content}>
        <Text style={[textPresets.headerMedium, styles.title]}>
          {title}
        </Text>

        <Text style={[textPresets.bodyMedium, styles.subtitle]}>
          {subtitle}
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleNavigate}>
          <Text style={[textPresets.button, styles.buttonText]}>
            See all your tasks
          </Text>
        </TouchableOpacity>
      </View>

      {todayTasks.length === 0 ? (
        <Ionicons
          name="cafe"
          size={64}
          color="#fff"
          style={styles.icon}
        />
      ) : (
        <View style={styles.progress}>
          <CircularProgress
            value={percentage}
            radius={40}
            maxValue={100}
            duration={1500}
            activeStrokeColor="#fff"
            inActiveStrokeColor="#72cef4"
            inActiveStrokeOpacity={0.5}
            progressValueColor={'#fff'}
            progressValueFontSize={18}
            titleStyle={{ display: 'none' }}
          />
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  content: {
    flex: 2,
    marginRight: 20,
  },
  title: {
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    color: '#fff',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#FF8C00',
    borderRadius: 15,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  icon: {
    marginRight: 15,
  },
  progress: {
    flex: 1,
  },
});