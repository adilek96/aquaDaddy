"use server"
import { z } from "zod";
// import { loginUserService} from "@/app/services/auth-service"
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


// const config = {
//   maxAge: 60 * 60 * 24 * 7, 
//   path: "/",
//   domain: process.env.HOST ?? "localhost",
//   httpOnly: true,
//   secure: process.env.NODE_ENV === "production",
// };


const schemaProfile = z.object({
    username: z.string()
      .min(3, { message: "415-6" })
      .max(100, { message: "415-2" }),
  
    country: z.string({ message: "415-7: Country code must be two uppercase letters" })
      .optional(),
   
    bio: z.string()
      .max(400, { message: "415-8: Bio must be 400 characters or less" })
      .optional(),
  });
  
export async function profileImageUpdateAction(prevState: any, formData: FormData) {
  const file = formData.get("picture");
  const id = formData.get("id");
  console.log(file)
  return {
    ...prevState,
    strapiErrors: "responseData.error",
    zodErrors: null,
    message: "415-8",
  };
}


export async function profileUpdateAction(prevState: any, formData: FormData) {

    const validatedFields = schemaProfile.safeParse({
       
        name: formData.get("name"),
        country: formData.get("country"),
        bio: formData.get("bio")
        
    })
   
 

    // if(!validatedFields.success){
    //     return {
    //         ...prevState,
    //         zodErrors: validatedFields.error.flatten().fieldErrors,
    //         message: "415-5"
    //     }
    // }

 
    
  
    // const responseData = await loginUserService(validatedFields.data);
    
    // if (!responseData) {
    //   return {
    //     ...prevState,
    //     strapiErrors: null,
    //     zodErrors: null,
    //     message: "415-6",
    //   };
    // }
  
    // if (responseData.error) {
    //   return {
    //     ...prevState,
    //     strapiErrors: responseData.error,
    //     zodErrors: null,
    //     message: "415-8",
    //   };
    // }

   
    // cookies().set("jwt", responseData.jwt, config);
    // redirect("/");
    return {
            ...prevState,
            strapiErrors: "responseData.error",
            zodErrors: null,
            message: "415-8",
          };

  
}