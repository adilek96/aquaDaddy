"use client";
import { useEffect, useRef, useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { SubmitButton } from "../ui/submitButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { GlobeIcon } from "@/public/globe";
import { useFormState } from "react-dom";
import {
  profileUpdateAction,
  profileImageUpdateAction,
} from "@/app/actions/profileUpdateAction";
import ProfileImageUploderForm from "./profileImageUploderForm";
import { UserIcon } from "@/public/user";
import { getStrapiURL } from "@/lib/utils";

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

export function ProfileEditPage({ user }: { user: UserPromise }) {
  const uploadFormRef = useRef(null);
  const [formState, formAction] = useFormState(
    profileUpdateAction,
    INITIAL_STATE
  );
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [username, setUsername] = useState(user.data.username);
  const [usermail, setUsermail] = useState(user.data.email);
  const [usercountry, setUsercountry] = useState(user.data.country);
  const [userbio, setUserbio] = useState(user.data.bio);
  const url = new URL(user.data.photoUrl.url, getStrapiURL());

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://flagcdn.com/en/codes.json");
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
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="w-32 h-32">
              {url !== undefined || url !== null ? (
                <AvatarImage src={String(url)} alt="Profile picture" />
              ) : (
                <UserIcon />
              )}

              <AvatarFallback>JP</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 left-0 p-1 bg-primary rounded-full">
              <ProfileImageUploderForm id={user.data.id} />
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

        <form action={formAction}>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="John Doe"
              defaultValue={username}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              defaultValue={usermail}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select name="country" onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Tell us about yourself"
              className="resize-none max-w-md mx-auto  "
              rows={4}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <SubmitButton
          className="w-full"
          text={"Save changes"}
          loadingText="Loading"
        />
      </CardFooter>
    </Card>
  );
}
