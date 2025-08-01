import HomeButton from "./homeButton";
import LanguageToggle from "./languageToggle";
import { UserMenu } from "./userMenu";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between dark:bg-black/20  bg-[#00EBFF]/5  backdrop-blur-md border-b border-muted px-4 md:px-6 h-16 ">
      <div className="flex flex-nowrap">
        <HomeButton />
        <LanguageToggle />
      </div>
      <div>
        <UserMenu />
      </div>
    </header>
  );
}
