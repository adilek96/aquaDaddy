import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { GlobeIcon } from "@/public/globe";
import { UserIcon } from "@/public/user";
import { Fish, Flower, Shell, Waves } from "lucide-react";

export function MyAquariums() {
  const url = "https://strapi.aquadaddy.app/uploads/medium_4e33e18383.webp";
  return (
    <div className="w-[98%] mx-auto bg-[#00EBFF]/10 rounded-xl backdrop-blur-md border border-muted z-40 mt-20">
      <div className="w-full h-[200px] bg-red-800 rounded-t-xl"></div>
      <div className="w-full h-fit  flex flex-row flex-wrap">
        <div className="md:w-[30%] w-full h-fit flex justify-center">
          <Card className="w-[300px] h-fit mb-10 pb-10 border border-mutted  rounded-2xl relative flex justify-center bg-white">
            <div className="w-[130px] h-[130px] absolute -top-12 flex items-center justify-center  rounded-full bg-white">
              <Avatar className="w-[120px] h-[120px] flex items-center justify-center">
                {url !== null ? (
                  <AvatarImage src={String(url)} alt="Profile picture" />
                ) : (
                  <UserIcon />
                )}

                <AvatarFallback>JP</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full overflow-hidden border-2 border-background">
                {true ? (
                  <div className="w-full h-full  flex justify-center items-center bg-primary text-primary-foreground">
                    <GlobeIcon className="h-5 w-5" />
                  </div>
                ) : (
                  ""
                  // <img
                  //   src={`https://flagcdn.com/w40/${selectedCountry.toLowerCase()}.png`}
                  //   alt={`Flag of ${selectedCountry}`}
                  //   className="w-full h-full object-cover"
                  // />
                )}
              </div>
            </div>
            <div className="mt-[100px] w-full flex flex-col  items-center">
              <h2 className="text-xl font-semibold mb-2">User Name</h2>
              <p className="text-muted-foreground mb-4">
                5 Aquariums | 2 Published
              </p>
              <div>
                <h3 className="text-lg font-semibold mb-2">Collections</h3>
              </div>
            </div>
          </Card>
        </div>
        <div className="md:w-[70%] w-full h-[250px] bg-gray-300"></div>
      </div>
    </div>
  );
}
