export default class EnvKeyNotFoundException extends Error {
  constructor(key: string) {
    super(`Environment variable '${key}' was not found. Please ensure it is defined in your .env file.`);
    this.name = 'EnvKeyNotFoundException';
  }
}
