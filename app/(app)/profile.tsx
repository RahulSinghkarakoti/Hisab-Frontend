// app/(app)/profile.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/hooks/useAuthMutations';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const { mutate: logout, isPending } = useLogout();

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{user?.firstName}</Text>
      <Text style={styles.name}>{user?.lastName}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.email}>{user?.role}</Text>

      <TouchableOpacity
        style={[styles.logoutBtn, isPending && styles.disabled]}
        onPress={() => logout()}
        disabled={isPending}
      >
        <Text style={styles.logoutText}>{isPending ? 'Logging out...' : 'Logout'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  name: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 4 },
  email: { fontSize: 15, color: '#666', marginBottom: 40 },
  logoutBtn: {
    backgroundColor: '#ef4444', paddingVertical: 14,
    paddingHorizontal: 40, borderRadius: 10,
  },
  disabled: { opacity: 0.6 },
  logoutText: { color: '#fff', fontWeight: '600', fontSize: 15 },
}); 