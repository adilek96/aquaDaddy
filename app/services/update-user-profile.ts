import { getAuthToken } from "./get-token"
import { getStrapiURL } from "@/lib/utils";


export async function updateUserProfile({userData, id}:{userData:any, id:any}) {
  const baseUrl = getStrapiURL();
  const url = new URL(`/api/users/${id}?populate=photoUrl`, baseUrl);


  const authToken = await getAuthToken();
  if (!authToken) return { ok: false, data: null, error: null };



  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (data.error) return { ok: false, data: null, error: data.error };
    return { ok: true, data: data, error: null }
  } catch (error) {
    console.log(error);
    return { ok: false, data: null, error: error };
  }
}

