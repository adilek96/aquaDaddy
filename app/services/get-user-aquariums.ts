'use server'
import { getAuthToken } from "./get-token"
import { getStrapiURL } from "@/lib/utils";


export async function getUserAquariums() {

  const baseUrl = getStrapiURL();
  const url = new URL("/api/users/me?populate[aquariums][populate][images][fields][0]=url&populate[photoUrl][fields][0]=url", baseUrl);
 
  

  const authToken = await getAuthToken();
  if (!authToken) return { ok: false, data: null, error: null };

  try {
    const response = await fetch(url.href, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      cache: "no-cache",
    });
    const data = await response.json();
    if (data.error) return { ok: false, data: null, error: data.error };
    return { ok: true, data: data, error: null };
  } catch (error) {
    console.log(error);
    return { ok: false, data: null, error: error };
  }
}