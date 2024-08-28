import LanguageToggle from "./languageToggle";
import { UserMenu } from "./userMenu";

export async function Header({ locale }: { locale: string }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-[00EBFF]  backdrop-blur-md border-b border-muted px-4 md:px-6 h-16">
      <LanguageToggle />
      <UserMenu locale={locale} />
    </header>
  );
}
