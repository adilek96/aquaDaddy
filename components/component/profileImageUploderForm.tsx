"use client";
import React, { useRef } from "react";
import { Label } from "../ui/label";
import { Camera } from "lucide-react";
import { Input } from "../ui/input";
import { profileImageUpdateAction } from "@/app/actions/profileUpdateAction";
import { useFormState } from "react-dom";

const INITIAL_STATE = {
  data: null,
  zodErrors: null,
  strapiErrors: null,
  message: null,
};

export default function ProfileImageUploderForm({ id }: { id: any }) {
  const formRef = useRef<HTMLFormElement>(null);

  const [formState, formAction] = useFormState(
    profileImageUpdateAction,
    INITIAL_STATE
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Файл выбран:", e.target.files);
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  return (
    <>
      <form
        ref={formRef}
        // method="POST"
        // encType="multipart/form-data"
        action={formAction}
      >
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
        <input type="number" name="id" value={id} readOnly className="hidden" />
      </form>
    </>
  );
}
