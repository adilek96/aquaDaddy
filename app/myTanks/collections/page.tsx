import { Fish, Flower, Shell, Waves } from "lucide-react";
import TankCard from "@/components/component/tankCard";
import Link from "next/link";

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

export default function Collection() {
  return (
    <>
      <h2 className="text-3xl font-bold my-10 ml-5 font-bebas  leading-none  tracking-wide   cursor-default ">
        <span>
          <Link href={"../myTanks"}>My Aquariums</Link>
        </span>
        <span> / </span>
        <span>
          <Link href={"../myTanks/collections"}>Collections</Link>
        </span>
      </h2>
      <div className="flex flex-wrap justify-evenly mb-10">
        {user.aquariums.map((aquarium, index) => (
          <TankCard aquarium={aquarium} key={index} />
        ))}
      </div>
    </>
  );
}
