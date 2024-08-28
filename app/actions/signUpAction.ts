"use server"
import { z } from "zod";
import { registerUserService } from "@/app/services/auth-service"



const schemaRegister = z.object({
    username: z.string().min(3, {
      message: "415-7"
    }).max(20, {
      message: "415-1",
    }),
    password: z.string().min(6, {
      message: "415-6"
    }).max(100, {
      message: "415-2",
    }),

    repeatPassword: z.string().min(6, {
      message: "415-6"
    }).max(100, {
      message: "415-2",
    }),

    email: z.string().email({
      message: "415-3",
    }),

  }).refine((data) => data.password === data.repeatPassword, {
    
    message: "415-4",
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
            message: "415-5"
        }
    }

 
  
    const responseData = await registerUserService(validatedFields.data);

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
        message: "415-7",
      };
    }

   
    return {
      ...prevState,
      data: "ok",
      strapiErrors: null,
      zodErrors: null,
      message: null,
    };
  

  
}