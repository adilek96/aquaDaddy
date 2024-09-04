"use server"
import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { uploadImages } from "../services/uploadImage";
import { updateUserProfile } from "../services/update-user-profile";
import { revalidatePath } from "next/cache";
import { getUserMeLoader } from "../services/get-user-me-loader";


const MAX_FILE_SIZE = 5000000;

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// VALIDATE IMAGE WITH ZOD 
const imageSchema = z.object({
  image: z
    .any()
    .refine((file) => {
      if (file.size === 0 || file.name === undefined) return false;
      else return true;
    }, "415-8")

    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "415-10"
    )
    .refine((file) => file.size <= MAX_FILE_SIZE, "415-9"),
});


export async function profileImageUpdateAction(prevState: any, formData: FormData) {
  const file = formData.get("picture");
  const userPromise = await getUserMeLoader();
  const id = userPromise.data.id;
  
  
  


  const validatedFields = imageSchema.safeParse({
    image: file,
  });

  

  if (!validatedFields.success) {
    return {
      ...prevState,
      zodErrors: validatedFields.error.flatten().fieldErrors,
      strapiErrors: null,
      data: null,
      message: "415-11",
    };
  }
  
  // CONVERT FORM DATA TO OBJECT
  const data = Object.fromEntries(formData); 
 
  
  const responseData = await uploadImages(data);
  

  if (!responseData.ok) {
    return {
      ...prevState,
      zodErrors: null,
      strapiErrors: "415-12",
      data: null,
      message: "415-12",
    };
  }

   
 

  
  const userData = {
    photoUrl:  responseData.data[0]
  }

  const updateProfile = await  updateUserProfile({userData, id})

  if (!updateProfile.ok) {
    return {
      ...prevState,
      zodErrors: null,
      strapiErrors: "415-13",
      data: null,
      message: "415-13",
    };
  }


  revalidatePath("[slug]/profile")

}


const schemaProfile = z.object({
  username: z.string()
    .min(3, { message: "415-7" })
    .max(100, { message: "415-11" }),

    country: z.string().nullable().optional(),
 
  bio: z.string()
    .max(400, { message: "415-13" })
    .optional(),
});


export async function profileUpdateAction(prevState: any, formData: FormData) {
    const userPromise = await getUserMeLoader();
    const id = userPromise.data.id;




    const validatedFields = schemaProfile.safeParse({
       
        username: formData.get("name"),
        country:  formData.get("country") || null, 
        bio: formData.get("bio")
        
    })
    
   
    if (!validatedFields.success) {
      return {
        ...prevState,
        zodErrors: validatedFields.error.flatten().fieldErrors,
        strapiErrors: null,
        data: null,
        message: "415-14",
      };
    }

    const userData = validatedFields.data;


   const updateResponse = await updateUserProfile({userData, id })

   
    
    if (!updateResponse.ok) {
      return {
        ...prevState,
        strapiErrors: null,
        zodErrors: null,
        message: "415-13",
      };
    }
  

    revalidatePath("[slug]/profile")
   


  
}