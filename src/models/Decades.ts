export class Decades {
  valid_decades = {
    availables: [],
  };

  constructor() {
    const actualDecade = `${String(new Date().getFullYear()).substring(3, 0)}0`;
    for (let i = Number(actualDecade); i >= 1890; i -= 10) {
      this.valid_decades.availables.unshift(i);
    }
  }
}
