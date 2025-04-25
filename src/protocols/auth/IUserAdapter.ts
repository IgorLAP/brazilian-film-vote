export interface IUserAdapter {
  update: (name: string, photoURL: string) => Promise<void>;
}
