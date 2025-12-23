import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<any>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const login = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
  };

  const logout = async () => {
    await fetch("/api/logout");
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
