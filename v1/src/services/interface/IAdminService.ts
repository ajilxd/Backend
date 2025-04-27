export interface IAdminService {
  authenticateAdmin(
    email: string,
    password: string
  ): Promise<{ accessToken: string; refreshToken: string }>;
  clearRefreshToken(): Promise<void>;
}
