import { UserSignOut } from "~/core/user/usecases";
import { ISignOutAdapter } from "~/protocols/auth";

export class UserSignOutImpl implements UserSignOut {
  constructor(private readonly userSignOutAdapter: ISignOutAdapter) {}

  signOut = async (): Promise<void> => {
    await this.userSignOutAdapter.signOut();
  };
}
