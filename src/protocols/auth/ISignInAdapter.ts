import { User } from "~/core/user/entity";

export interface ISignInAdapter {
  signIn: (email: string, password: string) => Promise<User>;
}
