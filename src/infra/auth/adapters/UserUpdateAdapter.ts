import { getAuth, updateProfile } from "firebase/auth";

import { IUserAdapter } from "~/protocols/auth";

export class UserUpdateAdapter implements IUserAdapter {
  async update(name: string, photoURL: string): Promise<void> {
    const auth = getAuth();

    await updateProfile(auth.currentUser, {
      displayName: name,
      photoURL,
    });
  }
}
