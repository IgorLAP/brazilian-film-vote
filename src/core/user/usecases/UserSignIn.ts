import { User } from "~/core/user/entity";

export interface UserSignin {
  signIn: (email: string, password: string) => Promise<User>;
}
