import { UserSignOutImpl } from "~/core/user/implementation";
import { SignOutAdapter } from "~/infra/auth/adapters";
import { CookiesAdapter } from "~/infra/cookies/adapters";
import { CookieService } from "~/services/cookies";

export const makeUserSignOut = () => {
  const cookieAdapter = new CookiesAdapter();
  const cookieService = new CookieService(cookieAdapter);
  const signOutAdapter = new SignOutAdapter(cookieService);
  return new UserSignOutImpl(signOutAdapter);
};
