"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { getMessages } from "next-intl/server";
import { measurCalcInch } from "@/components/helpers/measurCalcInch";
import { measurCalcGal } from "@/components/helpers/mesurCalcGal";

// Схема валидации для формы добавления аквариума
const AquariumSchema = z.object({
  name: z.string().min(1, "415-14").max(100, "415-15"),
  type: z.enum(["FRESHWATER", "SALTWATER", "PALUDARIUM"], {
    required_error: "415-16",
  }),
  shape: z.string().min(1, "415-17"),
  description: z.string().optional(),
  lengthCm: z.string().transform((val) => val === "" ? null : Number(val)).pipe(z.number().positive("415-18").nullable()),
  widthCm: z.string().transform((val) => val === "" ? null : Number(val)).pipe(z.number().positive("415-19").nullable()),
  heightCm: z.string().transform((val) => val === "" ? null : Number(val)).pipe(z.number().positive("415-20").nullable()),
  volumeLiters: z.string().transform((val) => val === "" ? null : Number(val)).pipe(z.number().positive("415-21").nullable()),
  startDate: z.string().optional().or(z.literal("")).refine((val) => {
    if (!val) return true; // если пустая строка или undefined — валидно
    const date = new Date(val);
    const now = new Date();
    return !isNaN(date.getTime()) && date <= now;
  }, "415-22"),
  measurementSystem: z.string().optional(),
  // Дополнительные поля для разных форм аквариума
  diameterCm: z.string().transform((val) => val === "" ? null : Number(val)).pipe(z.number().positive().nullable()),
  sideCm: z.string().transform((val) => val === "" ? null : Number(val)).pipe(z.number().positive().nullable()),
  depthCm: z.string().transform((val) => val === "" ? null : Number(val)).pipe(z.number().positive().nullable()),
  k: z.string().transform((val) => val === "" ? null : Number(val)).pipe(z.number().positive().nullable()),
});

type FormState = {
  data: any;
  zodErrors: Record<string, string[]> | null;
  message: string | null;
  success?: boolean;
  aquariumId?: string;
  aquariumName?: string;
};

export async function aquariumAddingAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // Получаем переводы в начале функции
  const messages = await getMessages();
 
  
  try {
    // Получаем текущего пользователя
    const session = await auth();
    
    if (!session?.user?.id) {
      return {
        data: null,
        zodErrors: null,
        message: (messages as any).AquariumForm?.loginRequired || "You must be logged in to add an aquarium",
      };
    }

    // Парсим и валидируем данные формы
    const rawData = {
      name: formData.get("name") || "",
      type: formData.get("type") || "",
      shape: formData.get("shape") || "",
      description: formData.get("description") || "",
      lengthCm: formData.get("lengthCm") || "",
      widthCm: formData.get("widthCm") || "",
      heightCm: formData.get("heightCm") || "",
      volumeLiters: formData.get("volumeLiters") || "",
      startDate: formData.get("startDate") || "",
      measurementSystem: formData.get("measurementSystem") || "",
      // Дополнительные поля для разных форм
      diameterCm: formData.get("diameterCm") || "",
      sideCm: formData.get("sideCm") || "",
      depthCm: formData.get("depthCm") || "",
      k: formData.get("k") || "",
    };

    

    const validatedData = AquariumSchema.parse(rawData);

    // Данные уже обработаны схемой валидации
    const processedData = validatedData;

    // Конвертируем единицы измерения если используется имперская система
    const measurementSystem = processedData.measurementSystem || "metric";
    let finalLengthCm = processedData.lengthCm;
    let finalWidthCm = processedData.widthCm;
    let finalHeightCm = processedData.heightCm;
    let finalVolumeLiters = processedData.volumeLiters;
    let finalDiameterCm = processedData.diameterCm;
    let finalSideCm = processedData.sideCm;
    let finalDepthCm = processedData.depthCm;
    let finalK = processedData.k;

    if (measurementSystem === "imperial") {
      // Конвертируем дюймы в сантиметры для хранения в базе данных
      if (finalLengthCm !== null && finalLengthCm !== undefined) {
        finalLengthCm = measurCalcInch(finalLengthCm, "imperial");
      }
      if (finalWidthCm !== null && finalWidthCm !== undefined) {
        finalWidthCm = measurCalcInch(finalWidthCm, "imperial");
      }
      if (finalHeightCm !== null && finalHeightCm !== undefined) {
        finalHeightCm = measurCalcInch(finalHeightCm, "imperial");
      }
      if (finalDiameterCm !== null && finalDiameterCm !== undefined) {
        finalDiameterCm = measurCalcInch(finalDiameterCm, "imperial");
      }
      if (finalSideCm !== null && finalSideCm !== undefined) {
        finalSideCm = measurCalcInch(finalSideCm, "imperial");
      }
      if (finalDepthCm !== null && finalDepthCm !== undefined) {
        finalDepthCm = measurCalcInch(finalDepthCm, "imperial");
      }
      // Конвертируем галлоны в литры для хранения в базе данных
      // measurCalcGal конвертирует литры в галлоны, но нам нужно наоборот
      if (finalVolumeLiters !== null && finalVolumeLiters !== undefined) {
        // Если пользователь ввел объем в галлонах, конвертируем в литры
        finalVolumeLiters = finalVolumeLiters * 3.78541;
      }
    }

 

   
    // Создаем аквариум в базе данных
    const aquarium = await prisma.aquarium.create({
      data: {
        userId: session.user.id,
        name: processedData.name,
        type: processedData.type,
        shape: processedData.shape,
        description: processedData.description || null,
        lengthCm: finalLengthCm,
        widthCm: finalWidthCm,
        heightCm: finalHeightCm,
        volumeLiters: finalVolumeLiters,
        startDate: processedData.startDate ? new Date(processedData.startDate) : null,
        // Дополнительные поля для разных форм
        diameterCm: finalDiameterCm,
        sideCm: finalSideCm,
        depthCm: finalDepthCm,
        k: finalK,
      },
    });

    // Обновляем кэш страницы
    revalidatePath("/myTanks");

    return {
      data: aquarium,
      zodErrors: null,
      message: (messages as any).AquariumForm?.successMessage || "Aquarium added successfully!",
      success: true,
      aquariumId: aquarium.id,
      aquariumName: aquarium.name,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Обрабатываем ошибки валидации
      console.log("Zod validation errors:", error.errors);
      const zodErrors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const field = err.path[0] as string;
        if (!zodErrors[field]) {
          zodErrors[field] = [];
        }
        zodErrors[field].push(err.message);
      });

      console.log("Processed zod errors:", zodErrors);
      return {
        data: null,
        zodErrors,
        message: (messages as any).AquariumForm?.fixErrors || "Please fix the errors below",
      };
    }

    // Обрабатываем другие ошибки
    console.error("Error adding aquarium:", error);
    return {
      data: null,
      zodErrors: null,
      message: (messages as any).AquariumForm?.tryAgain || "Failed to add aquarium. Please try again.",
    };
  }
} 