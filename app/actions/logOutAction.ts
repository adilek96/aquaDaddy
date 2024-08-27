'use server'
import { cookies } from "next/headers";



export async function logOutAction() {
    cookies().delete("jwt");
}