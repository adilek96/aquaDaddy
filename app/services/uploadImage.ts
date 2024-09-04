'use server'
import { getAuthToken } from "./get-token"
import { getStrapiURL } from "@/lib/utils";


export async function uploadImages(data: any) {
  const baseUrl = getStrapiURL();
  const url = new URL("/api/upload/", baseUrl);


  const authToken = await getAuthToken();
  if (!authToken) return { ok: false, data: null, error: null };

  const formData = new FormData();
  formData.append("files", data.picture);
  

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData ,
    });
    const data = await response.json();
    if (data.error) return { ok: false, data: null, error: data.error };
    return { ok: true, data: data, error: null }
  } catch (error) {
    return { ok: false, data: null, error: error };
  }
}