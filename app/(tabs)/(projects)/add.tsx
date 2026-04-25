import { useMemo } from 'react'
import {ActivityIndicator, StyleSheet, Platform, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native'
import { useRouter } from 'expo-router'
import { CustomButton, CustomInput, LabeledPicker, SelectDeadlineInput, LoadingIndicator } from '@components/index'
import { colors } from '@theme/index'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToastNotification } from '@hooks/useToastNotification'
import { useAddProject } from '@hooks/queries/useProjects'
import { useCategories } from '@hooks/queries/useCategories'
import { Category, CreateProjectDTO } from 'schemas'
import { useMe } from '@hooks/queries/useMe'

const projectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  deadline: z.string().optional(),
})

type FormData = z.infer<typeof projectSchema>

export default function AddProjectScreen() {
  const router = useRouter()
  const { data:user, isLoading: loadingUser } = useMe()
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const { mutateAsync, isPending } = useAddProject();
  const { showSuccess, showError } = useToastNotification()

  if(!user) return null;

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      categoryId: '',
      deadline: '',
    },
  })

  const pickerItems = useMemo(
    () => [
      ...categories.map((c: Category) => ({
        label: c.name,
        value: c.id,
      })),
    ],
    [categories]
  );

  const onSubmit = async (data: FormData) => {
    let deadline = data.deadline?.trim()

    const payload: CreateProjectDTO = {
      ...data,
      deadline,
      managerId: user.id,
    }

    try {
      const project = await mutateAsync(payload);
      showSuccess('Project Created', 'Your project has been created successfully!');
      router.push({ pathname: '/(tabs)/(projects)/view/[id]', params: { id: project.id } });
    } catch (err) {
      showError('Error', 'Failed to create project');
    }
  }

  if (loadingUser || categoriesLoading) {
    return <LoadingIndicator />
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ padding: 15 }}>
          <CustomInput
            name="name"
            control={control}
            label="Project Title"
            placeholder="Project name..."
            error={errors.name?.message}
          />

          {categoriesLoading ? (
            <ActivityIndicator color={colors.darkBlue} />
          ) : (
            <LabeledPicker
              name="categoryId"
              control={control}
              label="Category"
              items={pickerItems}
              placeholder="Select category"
              error={errors.categoryId?.message}
            />
          )}

          <CustomInput
            name="description"
            control={control}
            label="Project Description"
            placeholder="Project description..."
            multiline
          />

          <SelectDeadlineInput
            name="deadline"
            control={control}
            error={errors.deadline?.message}
          />

          <CustomButton
            title="Create"
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
          />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({ 
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: colors.background.primary, 
  }, 
});