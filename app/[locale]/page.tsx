import { Bg } from "@/components/animations/bg";
import { MainPage } from "@/components/component/main-page";

export default function Home() {
  return (
    <main className="flex relative w-full h-full min-h-screen flex-col items-center justify-between bg-transparent bg-opacity-0 ">
      <div className="z-40">
        <MainPage />
      </div>

      <div
        className="w-[100vw] h-[100vh] absolute z-10 overflow-hidden  "
        style={{ width: "100%", height: "100%" }}
      >
        <Bg />
      </div>
    </main>
  );
}
