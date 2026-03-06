import { useMutation,useQueryClient  } from "@tanstack/react-query";
import { useRouter } from 'expo-router';
import { authService } from '../services/authService';


export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: () => {
      // Auth store is already updated inside authService.login
      // Just navigate — the root layout guard will also handle this
      // but explicit navigation is snappier
      router.replace('/(app)');
    },
  });
};

export const useSignup=()=>{
    const router=useRouter()
    return useMutation({
        mutationFn:authService.signup,
        onSuccess:()=>{
            router.replace('/(app)');
        }
    })
}

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Clear ALL cached queries on logout — important
      // so next user doesn't see previous user's data
      queryClient.clear();
      router.replace('/(auth)/login');
    },
  });
};