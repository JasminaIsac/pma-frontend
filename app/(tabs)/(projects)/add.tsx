import { useMemo } from 'react'
import { ActivityIndicator, StyleSheet, Platform, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native'
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
import { useTranslation } from 'react-i18next'

type FormData = {
  name: string;
  description?: string;
  categoryId: string;
  deadline?: string;
}

export default function AddProjectScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const { data: user, isLoading: loadingUser } = useMe()
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const { mutateAsync, isPending } = useAddProject()
  const { showSuccess, showError } = useToastNotification()

  const projectSchema = useMemo(() => z.object({
    name: z.string().min(3, t('validation.nameMinChars', { count: 3 })),
    description: z.string().optional(),
    categoryId: z.string().min(1, t('validation.categoryRequired')),
    deadline: z.string().optional(),
  }), [t])

  const {
    control,
    handleSubmit,
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
    () => categories.map((c: Category) => ({ label: c.name, value: c.id })),
    [categories]
  )

  const onSubmit = async (data: FormData) => {
    if (!user?.id) return
    const payload: CreateProjectDTO = {
      ...data,
      deadline: data.deadline?.trim(),
    }
    try {
      const project = await mutateAsync(payload)
      showSuccess(t('projects.created'), t('projects.createdMsg'))
      router.replace({ pathname: '/(tabs)/(projects)/view/[id]', params: { id: project.id } })
    } catch {
      showError('Error', t('projects.failedCreate'))
    }
  }

  if (loadingUser || categoriesLoading) return <LoadingIndicator />

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
            label={t('projects.name')}
            placeholder={t('projects.name')}
            error={errors.name?.message}
          />

          {categoriesLoading ? (
            <ActivityIndicator color={colors.darkBlue} />
          ) : (
            <LabeledPicker
              name="categoryId"
              control={control}
              label={t('projects.category')}
              items={pickerItems}
              placeholder={t('projects.selectCategory')}
              error={errors.categoryId?.message}
            />
          )}

          <CustomInput
            name="description"
            control={control}
            label={t('projects.description')}
            placeholder={t('projects.description')}
            multiline
          />

          <SelectDeadlineInput
            name="deadline"
            control={control}
            error={errors.deadline?.message}
          />

          <CustomButton
            title={t('projects.create')}
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
})
