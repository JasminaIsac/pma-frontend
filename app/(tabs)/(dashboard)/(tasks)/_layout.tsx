import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

const TaskLayout = () => {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: t('tasks.title') }} />
      <Stack.Screen name="add" options={{ title: t('tasks.addTask') }} />
      <Stack.Screen name="view/[id]" options={{ title: t('tasks.details') }} />
      <Stack.Screen name="edit/[id]" options={{ title: t('tasks.edit') }} />
    </Stack>
  );
};

export default TaskLayout;
