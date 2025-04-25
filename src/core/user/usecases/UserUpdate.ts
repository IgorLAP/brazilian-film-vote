export interface UserUpdate {
  update: (name: string, photoURL: string) => Promise<void>;
}
