"use server"
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


const schemaRegister = z.object({
    username: z.string().min(3).max(20, {
      message: "Username must be between 3 and 20 characters",
    }),
    password: z.string().min(6).max(100, {
      message: "Password must be between 6 and 100 characters",
    }),
    repeatPassword: z.string().min(6).max(100, {
        message: "Password must be between 6 and 100 characters",
      }),
    email: z.string().email({
      message: "Please enter a valid email address",
    }),
  }).refine((data) => data.password === data.repeatPassword, {
    
    message: "Passwords don't match",
    path: ['repeatPassword']
  });


export async function signUpAction(prevState: any, formData: FormData) {

    const validatedFields = schemaRegister.safeParse({
        username: formData.get("username"),
        password: formData.get("password"),
        email: formData.get("email"),
        repeatPassword: formData.get("repeatPassword")
    })


    if(!validatedFields.success){
        return {
            ...prevState,
            zodErrors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Register"
        }
    }

 
  
  return {
  
    ...prevState,
    data: "ok"

  };

  

  
}