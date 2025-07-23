import React from "react";

export default function LoadingBlock({ translate }: { translate: string }) {
  return (
    <div className="text-2xl font-bold w-full text-center h-[50vh] flex items-center justify-center">
      {translate}
    </div>
  );
}
