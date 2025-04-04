import { User } from "~/core/user/entity";
import { UserSignin } from "~/core/user/usecases";
import { ISignInAdapter } from "~/protocols/auth";

export class UserSignInImpl implements UserSignin {
  constructor(private readonly userSigninAdapter: ISignInAdapter) {}

  async signIn(email: string, password: string): Promise<User> {
    const user = await this.userSigninAdapter.signIn(email, password);

    return {
      uid: user.uid,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    };
  }
}
