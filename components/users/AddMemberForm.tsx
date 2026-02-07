import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router'; 
import { UserRole, ID } from 'schemas'; 
import useToastNotification from '@hooks/useToastNotification'; 
import { useAvailableProjectUsers,useAddUserToProject } from '@hooks/queries/useProjectMembers';
import { CustomButton, SimplePicker } from '@components/index'; 

interface Props {
  projectId: ID;
}

export const AddMemberForm = ( { projectId }: Props) => { 
  const router = useRouter(); 

  const { data: availableUsers = [] } = useAvailableProjectUsers(projectId as ID); 
  const addMemberMutation = useAddUserToProject(); 
  const { showSuccess, showError } = useToastNotification(); 
  const [selectedUser, setSelectedUser] = useState<ID | null>(null); 
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>(''); 
  const [error, setError] = useState<string>(''); 
  
  const handleAdd = () => { 
    if (!selectedUser || !selectedRole || !projectId) { 
      setError('Please select both a user and a role.');
       return; 
      } 
      addMemberMutation.mutate({ 
        userId: selectedUser, projectId: projectId as ID, userRole: selectedRole, 
        }, { 
          onSuccess: () => { 
            showSuccess('Success', 'User added successfully'); 
            setSelectedUser(null); 
            setSelectedRole(''); 
            setError(''); 
          }, 
          onError: (err) => { 
            console.error('ADD MEMBER: ', err); 
            showError('Error', 'Failed to add member: ' + err); 
          }, 
        }, 
      ); 
    }; 
  
  return ( 
    <View style={styles.form}> 
    <SimplePicker 
      label="Select User" 
      placeholder="Select User" 
      value={selectedUser} 
      items={availableUsers.map((u) => ({ label: u.name, value: u.id, }))} 
      onChange={(val) => { setSelectedUser(val as ID); setError(''); }} 
      error={error} 
    /> 
    <SimplePicker 
      label="Select Role" 
      placeholder="Select Role" 
      value={selectedRole} 
      items={[ 
        { label: 'Developer', value: UserRole.DEVELOPER }, 
        { label: 'Project Manager', value: UserRole.PROJECT_MANAGER }, 
      ]} 
      onChange={(val) => { 
        setSelectedRole(val as UserRole); 
        setError(''); 
      }} 
      error={error} 
    /> 
    <CustomButton 
      title="Add Member" 
      type="primary" 
      onPress={handleAdd} 
    /> 
    <CustomButton 
      title="Cancel" 
      type="secondary" 
      onPress={() => router.back()} 
    /> 
    </View> 
  ); 
}; 

const styles = StyleSheet.create({ 
  form: { gap: 10, padding: 16, }, 
}); 
