import { useMemo} from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LoadingIndicator, UserCard } from '@components/index';
import { colors, textPresets } from '@theme/index';
import { sortUsersByRole } from '@utils/index';
import { useUsersCursor } from '@hooks/queries/useUsers';
import { User } from 'schemas';

const AllUsersScreen = () => {
  const router = useRouter();
  
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useUsersCursor(20);

  const users: User[] = useMemo(() => {
    const allUsers = data?.pages.flatMap(page => page.items) ?? [];
    return sortUsersByRole(allUsers);
  }, [data]);

  const handleUserClick = (user: User) => {
    router.push({ pathname: `(users)/view/${user.id}`});
  };

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <View style={styles.layout}>
      {users.length > 0 ? (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16 }}
          renderItem={({ item }) => (
            <UserCard
              user={item}
              onPress={() => handleUserClick(item)}
            />
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.6}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator
                size="small"
                color={colors.darkBlue}
                style={{ marginVertical: 20 }}
              />
            ) : null
          }
        />
      ) : (
        <Text
          style={[
            textPresets.noData,
            { color: colors.text.secondary, marginTop: 50 },
          ]}
        >
          No users
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: colors.background.secondary,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AllUsersScreen;