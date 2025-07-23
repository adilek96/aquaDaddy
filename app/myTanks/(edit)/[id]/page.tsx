import React from "react";

export default function EditAquarium({ params }: { params: { id: string } }) {
  const { id } = params;
  console.log(id);
  return (
    <>
      <div className="w-full h-fit border border-mutted bg-white/60 dark:bg-black/60 my-12 px-5 rounded-xl">
        <h2 className="text-3xl md:text-4xl  font-bold my-10 ml-5 font-bebas  leading-none  tracking-wide   cursor-default inline-flex flex-wrap ">
          Edit Aquarium
        </h2>
      </div>
    </>
  );
}
