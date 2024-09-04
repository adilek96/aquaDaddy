"use client";
export const dynamic = "force-static";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SubmitButton } from "../ui/submitButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useFormState } from "react-dom";
import { profileUpdateAction } from "@/app/actions/profileUpdateAction";
import ProfileImageUploderForm from "./profileImageUploderForm";
import { getStrapiURL } from "@/lib/utils";
import { StrapiErrors } from "../helpers/StrapiErrors";
import { ZodErrors } from "../helpers/ZodErrors";
import { useTranslations } from "next-intl";

interface Country {
  code: string;
  name: string;
}

type UserPromise =
  | { ok: true; data: any; error: null }
  | { ok: false; data: null; error: any };

const INITIAL_STATE = {
  data: null,
  zodErrors: null,
  strapiErrors: null,
  message: null,
};

export function ProfileEditPage({
  user,
  locale,
}: {
  user: UserPromise;
  locale: string;
}) {
  const t = useTranslations("Profile");
  const [formState, formAction] = useFormState(
    profileUpdateAction,
    INITIAL_STATE
  );

  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(
    user.data.country
  );

  const url = new URL(user.data.photoUrl.url, getStrapiURL());

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const trueLocale = locale === "az" ? "en" : locale;
        const response = await fetch(
          `https://flagcdn.com/${trueLocale}/codes.json`
        );
        const data = await response.json();
        const formattedCountries: Country[] = Object.entries(data).map(
          ([code, name]) => ({
            code,
            name: name as string,
          })
        );
        setCountries(formattedCountries);
      } catch (error) {
        console.error("Error fetching country data:", error);
      }
    };

    fetchCountries();
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto bg-[#00EBFF]/5  backdrop-blur-md border border-muted z-40 mt-20 mb-10 ">
      <CardHeader className="text-center">
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ProfileImageUploderForm url={url} selectedCountry={selectedCountry} />

        <form action={formAction}>
          <div className="space-y-2">
            <Label htmlFor="name">{t("username")}</Label>
            <Input
              id="name"
              name="name"
              placeholder="John Doe"
              defaultValue={user.data.username}
              required
            />
            <ZodErrors error={formState?.zodErrors?.username} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              defaultValue={user.data.email}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">{t("country")}</Label>
            <Select name="country" onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-[250px]">
                <SelectValue
                  placeholder={t("cauntryPlaceholder")}
                  defaultValue={user.data.country}
                />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ZodErrors error={formState?.zodErrors?.country} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">{t("bio")}</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Tell us about yourself"
              className="resize-none max-w-md mx-auto  "
              defaultValue={user.data.bio}
              rows={4}
            />
          </div>
          <ZodErrors error={formState?.zodErrors?.bio} />
          <CardFooter className="flex w-full flex-col mt-5 justify-center">
            <StrapiErrors error={formState?.strapiErrors?.message} />
            <SubmitButton
              className="w-full"
              text={t("button")}
              loadingText="Loading"
            />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
