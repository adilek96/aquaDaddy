import Link from "next/link";
import React from "react";
import { Card } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { UserIcon } from "@/public/user";
import { GlobeIcon } from "@/public/globe";
import { Fish, Flower, Shell, Waves } from "lucide-react";

const user = {
  name: "Jane Doe",
  avatar: "/placeholder.svg?height=200&width=200",
  totalAquariums: 5,
  publishedAquariums: 2,
  collections: [
    { name: "Plants", count: 25, icon: Flower },
    { name: "Fish", count: 30, icon: Fish },
    { name: "Molluscs", count: 10, icon: Shell },
    { name: "Crustaceans", count: 15, icon: Waves },
    { name: "Echinoderms", count: 15, icon: Waves },
    { name: "Corals", count: 15, icon: Waves },
  ],
  aquariums: [
    {
      name: "Tropical Paradise",
      image:
        "https://www.lyphardaquariums.com/cdn/shop/files/00152-3857423844.png?v=1719456392&width=3840",
      nextService: "2023-07-15",
    },
    {
      name: "Reef Adventure",
      image:
        "https://cdn11.bigcommerce.com/s-15h88fcyw7/images/stencil/870x1000/uploaded_images/fishtanksdirect-112914-saltwater-freshwater-aquariums-blogbanner1.jpg?t=1643986864",
      nextService: "2023-07-20",
    },
    {
      name: "Freshwater Oasis",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnMqvI6KBjAi572XK07mnCyXjmLxHj7K-Stw&s",
      nextService: "2023-07-25",
    },
  ],
};

export default function UserCard({ locale }: { locale: string }) {
  console.log(locale);
  const url = "https://strapi.aquadaddy.app/uploads/medium_4e33e18383.webp";
  return (
    <>
      <Card className="md:w-[350px] w-[95%] h-fit mb-10 pb-10 border border-mutted  rounded-2xl backdrop-blur-3xl relative flex justify-center bg-white/60 dark:bg-black/60">
        <div className="w-[130px] h-[130px] absolute -top-12 flex items-center justify-center backdrop-blur-3xl rounded-full bg-[#00EBFF]/20">
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
            <span>
              <Link
                href={`/${locale}/myTanks`}
                className="hover:text-green-300/50 dark:hover:text-green-300/80 transition-all duration-300 "
              >
                5 Aquariums
              </Link>
            </span>
            <span> | </span>
            <span>
              <Link
                href={`/${locale}/myTanks/published`}
                className="hover:text-green-300/50 dark:hover:text-green-300/80 transition-all duration-300 "
              >
                2 Published
              </Link>
            </span>
          </p>

          <div className="flex flex-col items-center">
            <Link
              href={`/${locale}/myTanks/collections`}
              className="hover:text-green-300/50 dark:hover:text-green-300/80 transition-all duration-300 "
            >
              <h3 className="text-lg font-semibold mb-2">Collections</h3>
            </Link>
            <div className="grid grid-cols-2 gap-4">
              {user.collections.map((collection, index) => (
                <Link
                  href={"#"}
                  key={index}
                  className="flex border border-muted bg-white/20 hover:bg-green-300/50 dark:hover:bg-green-700/70 dark:bg-black/20  transition-all duration-300 hover:translate-y-1  rounded-sm px-2 py-1 items-center space-x-2"
                >
                  <collection.icon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{collection.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {collection.count} Species
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
