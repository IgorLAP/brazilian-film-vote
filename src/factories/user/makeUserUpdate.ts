import { UserUpdateImpl } from "~/core/user/implementation";
import { UserUpdateAdapter } from "~/infra/auth/adapters";

export const makeUserUpdate = () => {
  const userUpdateAdapter = new UserUpdateAdapter();
  return new UserUpdateImpl(userUpdateAdapter);
};
