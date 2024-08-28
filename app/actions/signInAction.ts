"use server"
import { z } from "zod";
import { loginUserService} from "@/app/services/auth-service"
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


const config = {
  maxAge: 60 * 60 * 24 * 7, // 1 week
  path: "/",
  domain: process.env.HOST ?? "localhost",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};


const schemaLogIn = z.object({
 
    password: z.string().min(6, {
      message: "415-6"
    }).max(100, {
      message: "415-2",
      
    }),
   
    identifier: z.string().email({
      message: "415-3",
    }),
  })
  


export async function signInAction(prevState: any, formData: FormData) {

    const validatedFields = schemaLogIn.safeParse({
       
        password: formData.get("password"),
        identifier: formData.get("email"),
        
    })
   
    



    if(!validatedFields.success){
        return {
            ...prevState,
            zodErrors: validatedFields.error.flatten().fieldErrors,
            message: "415-5"
        }
    }

 
    
  
    const responseData = await loginUserService(validatedFields.data);
    
    if (!responseData) {
      return {
        ...prevState,
        strapiErrors: null,
        zodErrors: null,
        message: "415-6",
      };
    }
  
    if (responseData.error) {
      return {
        ...prevState,
        strapiErrors: responseData.error,
        zodErrors: null,
        message: "415-8",
      };
    }

   
    cookies().set("jwt", responseData.jwt, config);
    redirect("/");
  

  
}