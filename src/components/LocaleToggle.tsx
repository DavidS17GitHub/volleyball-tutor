import { useI18n, type Locale } from "../i18n";

const localeLabels: Record<Locale, string> = {
  en: "EN",
  es: "ES",
};

export function LocaleToggle() {
  const { locale, setLocale, supportedLocales } = useI18n();

  return (
    <div className="locale-toggle" aria-label="Language">
      {supportedLocales.map((option) => (
        <button
          aria-pressed={locale === option}
          className={locale === option ? "selected" : ""}
          key={option}
          onClick={() => setLocale(option)}
          type="button"
        >
          {localeLabels[option]}
        </button>
      ))}
    </div>
  );
}
