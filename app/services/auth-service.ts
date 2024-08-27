import { getStrapiURL } from "@/lib/utils";

interface RegisterUserProps {
  username: string;
  password: string;
  repeatPassword: string;
  email: string;
}

interface LoginUserProps {
  identifier: string;
  password: string;
}

interface ForgotPasswordProps {
  email: string;
}

interface ResetPasswordProps {
  password: string;
  passwordConfirmation: string;
  code: string;
}


const baseUrl = getStrapiURL();

export async function registerUserService(userData: RegisterUserProps) {
  const url = new URL("/api/auth/local/register", baseUrl);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...userData }),
      cache: "no-cache",
    });

    return response.json();
  } catch (error) {
    console.error("Registration Service Error:", error);
  }
}

export async function loginUserService(userData: LoginUserProps) {
  const url = new URL("/api/auth/local", baseUrl);
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      
      body: JSON.stringify({ ...userData }),
      cache: "no-cache",
    });

    

    return response.json();
  } catch (error) {
    console.error("Login Service Error:", error);
    throw error;
  }
}

export async function forgotPasswordService(userData: ForgotPasswordProps) {
  const url = new URL("/api/auth/forgot-password", baseUrl);
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      
      body: JSON.stringify({ ...userData }),
      cache: "no-cache",
    });

    
    
    return response.json();
  } catch (error) {
    console.error("Login Service Error:", error);
    throw error;
  }
}



export async function resetPasswordService(userData: ResetPasswordProps) {
  const url = new URL("/api/auth/reset-password", baseUrl);
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      
      body: JSON.stringify({ ...userData }),
      cache: "no-cache",
    });

    
    
    return response.json();
  } catch (error) {
    console.error("Login Service Error:", error);
    throw error;
  }
}
