"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signUpAction } from "@/app/actions/signUpAction";
import { useFormState } from "react-dom";
import { ZodErrors } from "../helpers/ZodErrors";

const INITIAL_STATE = {
  data: null,
  zodErrors: null,
  message: null,
};

export default function SignUpForm() {
  const [formState, formAction] = useFormState(signUpAction, INITIAL_STATE);

  console.log(formState);

  return (
    <Card className="w-full max-w-md mx-auto bg-[00EBFF]  backdrop-blur-md border border-muted z-40 mt-20">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create a new account to get started.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              required
            />
            <ZodErrors error={formState?.zodErrors?.username} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
            />
            <ZodErrors error={formState?.zodErrors?.email} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
            />
            <ZodErrors error={formState?.zodErrors?.password} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="repeatPassword">Repeat Password</Label>
            <Input
              id="repeatPassword"
              name="repeatPassword"
              type="password"
              placeholder="Repeat your password"
              required
            />
            <ZodErrors error={formState?.zodErrors?.repeatPassword} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
