'use server'
import { z } from "zod";
import { resetPasswordService} from "@/app/services/auth-service"
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const config = {
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
    domain: process.env.HOST ?? "localhost",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };


const schemaResetPassword = z.object({
    password: z.string().min(6).max(100, {
        message: "415.2",
      }),
      passwordConfirmation: z.string().min(6).max(100, {
        message: "415.2",
    }),
    code: z.string().min(1, {
        message: "Please get link in your email"
      }),
    }).refine((data) => data.password === data.passwordConfirmation, {
      message: "415.4",
      path: ["repeatPassword"], 
    });
  


export  async function resetPasswordAction(prevState: any, formData: FormData) {
    const validatedFields = schemaResetPassword.safeParse({
        password: formData.get("password"),
        passwordConfirmation: formData.get("repeatPassword"),
        code: formData.get("code"),
        
    })

    
    if(!validatedFields.success){
        return {
            ...prevState,
            zodErrors: validatedFields.error.flatten().fieldErrors,
            message: "415-5"
        }
    }

 
    
  
    const responseData = await resetPasswordService(validatedFields.data);
 
    
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
        message: "415-9",
      };
    }

   
    cookies().set("jwt", responseData.jwt, config);
    redirect("/");
  

}
