'use server'
import { cookies } from "next/headers";

const config = {
    path: "/",
    domain: process.env.HOST ?? "localhost",
    maxAge: -1
  };
  

export async function logOutAction() {
    cookies().set("jwt", '', config );
}