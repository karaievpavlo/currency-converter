export class Environment {
  readonly production: boolean;
  readonly apiUrl: string;
  readonly apiKey: string;

  constructor(
    production: boolean,
    apiUrl: string,
    apiKey: string
  ) {
    this.production = production;
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }
}