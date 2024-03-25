// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const assertUnreachable = (x: any): never => {
  throw new Error("Unreachable code reached", x);
};
