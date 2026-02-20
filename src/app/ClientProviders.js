// app/components/ClientProviders.js
"use client";

import { I18nextProvider } from 'react-i18next';
import i18n from './language/i18n';
import { NotificationProvider } from '@/components/shared/jsFiles/NotificationProvider';
import { LanguageProvider } from './language/LanguageProvider';

export default function ClientProviders({ children }) {
  // TODO: For SSR, get defaultLanguage from cookie or server prop
  const defaultLanguage = 'en';

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageProvider defaultLanguage={defaultLanguage}>
        <NotificationProvider>
          <main className="flex flex-col w-full min-h-screen h-screen bg-background text-primary">
            <div className="flex-1 max-h-full min-h-0 w-full flex flex-col items-center justify-center">
              {children}
            </div>
          </main>
        </NotificationProvider>
      </LanguageProvider>
    </I18nextProvider>
  );
}