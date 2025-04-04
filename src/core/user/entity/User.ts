export interface User {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  role: "ADMIN" | "USER";
}
