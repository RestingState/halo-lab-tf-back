export function getRandInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

export function shuffle<T>(array: T[]) {
  const arrClone = structuredClone(array);
  for (let i = arrClone.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    console.log({ i, j, arrClone });
    [arrClone[i], arrClone[j]] = [arrClone[j], arrClone[i]];
    console.log({ i, j, arrClone });
  }
  return arrClone;
}

export function exclude<T, Key extends keyof T>(
  obj: T,
  keys: Key[]
): Omit<T, Key> {
  for (let key of keys) {
    delete obj[key];
  }
  return obj;
}
