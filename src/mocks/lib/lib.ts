/* eslint-disable @typescript-eslint/no-explicit-any */
export function random(target: any[]) {
  return Math.floor(Math.random() * target['length']);
}

export function chunkArray<T>(array: T[], size: number): T[][] {
  if (size <= 0) throw new Error('Size must be greater than 0');
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size),
  );
}
