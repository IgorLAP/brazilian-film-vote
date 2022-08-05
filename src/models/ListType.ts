interface ListTypeI {
  name: string;
  decade: number;
}

export class ListType {
  decade: number;

  name: string;

  constructor({ name, decade }: ListTypeI) {
    this.name = name;
    this.decade = decade;
  }
}
