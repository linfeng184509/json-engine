declare module 'mockjs' {
  export function mock(template: object): object;
  export function mock(regex: RegExp, template: object): void;
  
  export const Random: {
    guid(): string;
    string(pool: string, length: number): string;
    integer(min: number, max: number): number;
    pick<T>(array: T[]): T;
    datetime(format?: string): string;
    date(format?: string): string;
    time(format?: string): string;
    [key: string]: unknown;
  };
  
  export function extend(options: object): void;
}