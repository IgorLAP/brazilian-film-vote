type Role = "ADMIN" | "USER";

interface UserI {
  email: string;
  name: string;
  photoURL?: string;
  role?: Role;
}

export class User {
  email: string;

  name: string;

  photoURL: string;

  role: Role;

  constructor({ email, name, photoURL = "", role = "USER" }: UserI) {
    this.email = email;
    this.name = name;
    this.photoURL = photoURL;
    this.role = role;
  }
}
