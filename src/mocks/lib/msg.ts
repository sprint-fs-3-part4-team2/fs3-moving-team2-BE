/* eslint-disable @typescript-eslint/no-explicit-any */
const line = '-----------------------------------------------------------------';
export function startMsg(str: string) {
  console.log(`${line}`);
  console.log(`📝 ${str}`);
  console.log(`${line}`);
}

export function passMsg(str: string, str2?: string) {
  if (!str2) str2 = '';
  console.log(`✅ ${str}`, str2);
}

export function errorMsg(str: string, err?: any) {
  if (!err) err = '';
  console.error(`❌ ${str} Error `, err);
}

export function endMsg(str: string) {
  console.log(`${line}`);
  console.log(`🚀 ${str}`);
}
