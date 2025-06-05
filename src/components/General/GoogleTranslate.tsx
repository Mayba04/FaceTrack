import { useEffect } from "react";

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

const GoogleTranslate = () => {
  useEffect(() => {
    // 1) Створюємо глобальну callback-функцію
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "uk",
          includedLanguages: "uk,en,pl",
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        "google_translate_element",
      );
    };

    // 2) Підвантажуємо скрипт Google
    const script = document.createElement("script");
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Весь віджет ховаємо — нам потрібен лише IFrame для API
  return <div id="google_translate_element" style={{ display: "none" }} />;
};

export default GoogleTranslate;
