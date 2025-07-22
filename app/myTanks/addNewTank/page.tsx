import AquariumAddingForm from "@/components/component/aquariumAddingForm";
import Link from "next/link";
import React from "react";

export default function AddNewTank() {
  return (
    <>
      <h2 className="text-3xl font-bold my-10 ml-5 font-bebas  leading-none  tracking-wide   cursor-default ">
        <span>
          <Link href={"../myTanks"}>My Aquariums</Link>
        </span>
      </h2>
      <AquariumAddingForm />
    </>
  );
}
