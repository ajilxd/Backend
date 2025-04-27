export interface IAuthService {
  authenticateUser(
    email: string,
    role: "manager" | "user"
  ): Promise<{ accessToken: string; refreshToken: string }>;
  clearRefreshToken(email: string, role: string): Promise<void>;
}
