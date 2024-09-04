"use client";
import React, { useRef } from "react";
import { Label } from "../ui/label";
import { Camera } from "lucide-react";
import { profileImageUpdateAction } from "@/app/actions/profileUpdateAction";
import { useFormState } from "react-dom";
import { ZodErrors } from "../helpers/ZodErrors";
import { StrapiErrors } from "../helpers/StrapiErrors";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { UserIcon } from "@/public/user";
import { GlobeIcon } from "@/public/globe";

const INITIAL_STATE = {
  data: null,
  zodErrors: null,
  strapiErrors: null,
  message: null,
};

export default function ProfileImageUploderForm({
  url,
  selectedCountry,
}: {
  url: null | URL;
  selectedCountry: null | string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  const [formState, formAction] = useFormState(
    profileImageUpdateAction,
    INITIAL_STATE
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  return (
    <>
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Avatar className="w-32 h-32">
            {url !== null ? (
              <AvatarImage src={String(url)} alt="Profile picture" />
            ) : (
              <UserIcon />
            )}

            <AvatarFallback>JP</AvatarFallback>
          </Avatar>

          <div className="absolute bottom-0 left-0 p-1 bg-primary rounded-full">
            <form ref={formRef} action={formAction}>
              <Label htmlFor="picture" className="cursor-pointer">
                <Camera className="w-5 h-5 text-primary-foreground" />
                <span className="sr-only">Upload new picture</span>
              </Label>
              <input
                id="picture"
                type="file"
                name="picture"
                className="hidden"
                onChange={handleImageChange}
              />
            </form>
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full overflow-hidden border-2 border-background">
            {selectedCountry === null ? (
              <div className="w-full h-full  flex justify-center items-center bg-primary text-primary-foreground">
                <GlobeIcon className="h-5 w-5" />
              </div>
            ) : (
              <img
                src={`https://flagcdn.com/w40/${selectedCountry.toLowerCase()}.png`}
                alt={`Flag of ${selectedCountry}`}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      </div>

      <ZodErrors error={formState?.zodErrors?.image} />
      <StrapiErrors error={formState?.strapiErrors?.message} />
    </>
  );
}
