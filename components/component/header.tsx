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

// function XIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M18 6 6 18" />
//       <path d="m6 6 12 12" />
//     </svg>
//   );
// }
