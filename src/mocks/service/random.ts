/* eslint-disable @typescript-eslint/no-explicit-any */
export default function random(target: any[]) {
  return Math.floor(Math.random() * target['length']);
}
