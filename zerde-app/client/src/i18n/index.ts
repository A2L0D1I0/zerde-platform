import { kz } from './kz';
import { ru } from './ru';
import { en } from './en';

export type TranslationKey = keyof typeof ru | keyof typeof kz | keyof typeof en;

export const translations = {
  KZ: kz,
  RU: ru,
  EN: en,
} as const;

export { kz, ru, en };
export default translations;
