import Image from "next/image";
import UserCard from "@/components/component/userCard";

export default async function MyTanksLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  console.log(locale);
  return (
    <>
      <div className="w-[95%] mx-auto dark:bg-black/10  bg-[#00EBFF]/5 rounded-xl backdrop-blur-md  border border-muted z-40 mt-20">
        <div className="h-[230px] relative w-full rounded-t-xl bg-gradient-to-r from-cyan-500 to-green-800 backdrop-blur-3xl">
          <Image
            src={"/app-logo.svg"}
            width={200}
            height={200}
            className="absolute right-10 bottom-0"
            alt="App logo"
          />
        </div>
        <div className="w-full h-fit  flex flex-row flex-wrap">
          <div className="md:w-[30%] w-full h-fit flex justify-center">
            <UserCard locale={locale} />
          </div>
          <div className="md:w-[70%] w-full h-full flex justify-center  mx-auto">
            <div className="w-[95%] h-fit border border-mutted bg-white/60 dark:bg-black/60 my-12 px-5 rounded-xl">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
