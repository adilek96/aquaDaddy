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
 
    password: z.string().min(6).max(100, {
      message: "Password must be between 6 and 100 characters",
    }),
   
    email: z.string().email({
      message: "Please enter a valid email address",
    }),
  })


export async function signInAction(prevState: any, formData: FormData) {

    const validatedFields = schemaLogIn.safeParse({
       
        password: formData.get("password"),
        email: formData.get("email"),
        
    })

    console.log(formData.get("email"))


    if(!validatedFields.success){
        return {
            ...prevState,
            zodErrors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Register"
        }
    }

 
  
    const responseData = await loginUserService(validatedFields.data);

    if (!responseData) {
      return {
        ...prevState,
        strapiErrors: null,
        zodErrors: null,
        message: "Ops! Something went wrong. Please try again.",
      };
    }
  
    if (responseData.error) {
      return {
        ...prevState,
        strapiErrors: responseData.error,
        zodErrors: null,
        message: "Failed to LogIn.",
      };
    }

   
    cookies().set("jwt", responseData.jwt, config);
    redirect("/");
  

  
}