export interface SignInResponse {
  AuthenticationResult: AuthenticationResult;
  ChallengeParameters: unknown;
}

export interface AuthenticationResult {
  AccessToken: string;
  ExpiresIn: number;
  TokenType: string;
  RefreshToken: string;
  IdToken: string;
}
