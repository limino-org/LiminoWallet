import { provide, inject } from "vue";
import { useI18n } from "vue-i18n";

export function useProvideI18n(): void {
   const { t } = useI18n();
   // Injection translation function
   provide("t", t);
}

export function useInjectI18n(): (text: string) => string {
  const t = inject("t") as (text: string) => string;
  return t;
}