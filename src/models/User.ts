type Role = "ADMIN" | "USER";

export class User {
  email: string;

  name: string;

  photoURL: string;

  role: Role;

  constructor(email: string, name: string, photoURL = "", role: Role = "USER") {
    this.email = email;
    this.name = name;
    this.photoURL = photoURL;
    this.role = role;
  }
}
