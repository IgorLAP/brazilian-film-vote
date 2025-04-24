import { getAuth, signOut as firebaseSignOut } from "firebase/auth";

import { ISignOutAdapter } from "~/protocols/auth";
import { ICookieService } from "~/protocols/cookies/ICookiesService";

export class SignOutAdapter implements ISignOutAdapter {
  constructor(private readonly cookieService: ICookieService) {}

  async signOut(): Promise<void> {
    const auth = getAuth();
    await firebaseSignOut(auth);
    this.cookieService.clearToken();
  }
}

