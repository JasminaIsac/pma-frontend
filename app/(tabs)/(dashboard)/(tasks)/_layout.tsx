import { Stack } from 'expo-router'

const TaskLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'All Tasks' }} />
      <Stack.Screen name="add" options={{ title: 'New Task' }} />
      <Stack.Screen name="view/[id]" options={{ title: 'Task Details' }} />
      <Stack.Screen name="edit/[id]" options={{ title: 'Edit Task' }} />
    </Stack>
  )
}

export default TaskLayout;
