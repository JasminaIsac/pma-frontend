import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ToastAndroid, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { colors } from "@theme/index";
import { User, ConversationType } from "schemas";
import { useUsers } from "@hooks/queries/useUsers";
import { useCreateConversation } from "@hooks/queries/useConversations";
import { GroupNameModal, SearchBar, UserCardConversation } from "@components/index";
import useToastNotification from "@hooks/useToastNotification";

const NewConversationScreen = () => {
  const navigation = useNavigation();
  const router = useRouter();

  const { data: users } = useUsers();
  const { mutate: createConversation, isPending } = useCreateConversation();

  const { showError } = useToastNotification();

  const [isGroupMode, setIsGroupMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showGroupNameModal, setShowGroupNameModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = React.useMemo(() => {
    if (!searchQuery) return users;
    return users?.filter((user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, users]);

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleUserPress = (user: User) => {
    if (!isGroupMode) {
      createConversation(
        {
          type: ConversationType.PRIVATE,
          participantIds: [user.id],
        }, 
        {
          onSuccess: (data) => {
            router.push(`/messages/${data.id}`);
          },
          onError: (error) => {
            if(Platform.OS === 'android') ToastAndroid.show(error.message, ToastAndroid.LONG);
            else showError('Error', error.message);
          }
        }
      );
      return;
    }

    toggleUser(user.id);
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: isGroupMode ? () => null : undefined,
      
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, marginRight: 5 }}>
          {isGroupMode && (
            <TouchableOpacity 
              onPress={() => {
                setIsGroupMode(false);
                setSelectedUsers([]);
              }}
            >
              <Text style={{ color: colors.button.delete, fontWeight: "600" }}>
                Cancel
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => {
              if (isGroupMode) {
                setShowGroupNameModal(true);
              } else {
                setIsGroupMode(true);
              }
            }}
            disabled={(isGroupMode && selectedUsers.length < 2) || isPending}
          >
            <Text
              style={{
                color: colors.mediumOrange,
                fontWeight: "700",
              }}
            >
              {isGroupMode ? "Done" : "Create Group"}
            </Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, isGroupMode, selectedUsers, isPending]);

  return (
    <View style={styles.container}>
      <SearchBar 
        value={searchQuery} 
        onChangeText={setSearchQuery} 
      />
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserCardConversation
            user={item}
            selectable={isGroupMode}
            selected={selectedUsers.includes(item.id)}
            onPress={() => handleUserPress(item)}
          />
        )}
      />

      <GroupNameModal
        visible={showGroupNameModal}
        onClose={() => setShowGroupNameModal(false)}
        onSubmit={(groupName) => {
          createConversation({
            type: ConversationType.GROUP,
            participantIds: selectedUsers,
            name: groupName,
          });
          setShowGroupNameModal(false);
          navigation.goBack();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: 10,
  },
});


export default NewConversationScreen;