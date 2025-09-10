export interface auth {
  username: string;
  password: string;
}

export interface signUp extends auth {
  firstName: string;
  lastName: string;
  email: string;
}
