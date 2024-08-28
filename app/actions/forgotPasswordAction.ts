'use server'
import { z } from "zod";
import { forgotPasswordService} from "@/app/services/auth-service"




const schemaForgotPassword = z.object({
    email: z.string().email({
      message: "415-3",
    }),
  })


export  async function forgotPasswordAction(prevState: any, formData: FormData) {
    const validatedFields = schemaForgotPassword.safeParse({
        email: formData.get("email"),
        
    })

    
    if(!validatedFields.success){
        return {
            ...prevState,
            zodErrors: validatedFields.error.flatten().fieldErrors,
            message: "415-5"
        }
    }

 
    
  
    const responseData = await forgotPasswordService(validatedFields.data);

    
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
        message: "415-10",
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
