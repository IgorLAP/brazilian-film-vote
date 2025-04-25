import { UserSignInImpl } from "~/core/user/implementation";
import { SignInAdapter } from "~/infra/auth/adapters";
import { CookiesAdapter } from "~/infra/cookies/adapters";
import { HttpClientAdapter } from "~/infra/http/adapters";
import { CookieService } from "~/services/cookies";

export function makeUserSignIn(): UserSignInImpl {
  const cookiesAdapter = new CookiesAdapter(); // Abstração de cookie
  const cookieService = new CookieService(cookiesAdapter); // Service agnóstico
  const httpClientAdapter = new HttpClientAdapter(); // Http infra
  const signInAdapter = new SignInAdapter(cookieService, httpClientAdapter); // Auth signin implementation (firebase)

  return new UserSignInImpl(signInAdapter); // Usecases com dependências injetadas
}
