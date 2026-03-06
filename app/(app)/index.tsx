// app/(app)/index.tsx
import { View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store/authStore';
export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Welcome back, {user?.firstName} 👋</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  greeting: { fontSize: 20, fontWeight: '600', color: '#111' },
});