export interface User {
  id?: string;
  username?: string;
  email?: string;
  password?: string;
}

interface UserAttributes {
  Name: string;
  Value: string;
}

export interface CognitoUserData {
  UserAttributes: UserAttributes[];
  Username: string;
}
