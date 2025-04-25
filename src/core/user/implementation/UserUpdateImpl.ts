import { UserUpdate } from "~/core/user/usecases";
import { IUserAdapter } from "~/protocols/auth";

export class UserUpdateImpl implements UserUpdate {
  constructor(private readonly userUpdateAdapter: IUserAdapter) {}

  async update(name: string, photoURL: string): Promise<void> {
    await this.userUpdateAdapter.update(name, photoURL);
  }
}
