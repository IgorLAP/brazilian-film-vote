import { Auth, getAuth, signInWithEmailAndPassword } from "firebase/auth";

import { User } from "~/core/user/entity";
import { getUserByEmail } from "~/presentation/helpers/get-user-by-email";
import { ISignInAdapter } from "~/protocols/auth";
import { ICookieService } from "~/protocols/cookies/ICookiesService";
import { IHttpClient } from "~/protocols/http";

export class SignInAdapter implements ISignInAdapter {
  constructor(
    private readonly cookieService: ICookieService,
    private readonly httpClient: IHttpClient,
  ) {}

  async signIn(email: string, password: string): Promise<User> {
    const auth = getAuth();
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getUserByEmail(email);

    this.setUserToken(await user.getIdToken());

    await this.checkUserRoleInFirebaseClaims(auth, userDoc.role);

    return {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      avatar: user.photoURL,
      role: userDoc.role,
    };
  }

  async setUserToken(token: string) {
    // FIXME: Token tá sendo usado nos cookies para verificar tipo de usuário através do SSR na função verifySSRAuth
    this.cookieService.setToken(token);
  }

  async checkUserRoleInFirebaseClaims(auth: Auth, role: "ADMIN" | "USER") {
    if (role === "USER") return;
    const { admin } = (await auth.currentUser.getIdTokenResult(true)).claims;
    if (!admin) {
      await this.setRoleToAdmin(auth.currentUser.uid);
    }
  }

  async setRoleToAdmin(uid: string) {
    await this.httpClient.post("/api/set-user-claim", { uid });
  }
}
