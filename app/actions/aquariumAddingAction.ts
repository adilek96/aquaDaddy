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
  lengthCm: z.coerce.number().positive("415-18").optional().or(z.literal("")),
  widthCm: z.coerce.number().positive("415-19").optional().or(z.literal("")),
  heightCm: z.coerce.number().positive("415-20").optional().or(z.literal("")),
  volumeLiters: z.coerce.number().positive("415-21").optional().or(z.literal("")),
  startDate: z.string().optional().or(z.literal("")),
  measurementSystem: z.string().optional(),
});

type FormState = {
  data: any;
  zodErrors: Record<string, string[]> | null;
  message: string | null;
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
      name: formData.get("name"),
      type: formData.get("type"),
      shape: formData.get("shape"),
      description: formData.get("description"),
      lengthCm: formData.get("lengthCm"),
      widthCm: formData.get("widthCm"),
      heightCm: formData.get("heightCm"),
      volumeLiters: formData.get("volumeLiters"),
      startDate: formData.get("startDate"),
      measurementSystem: formData.get("measurementSystem"),
    };

    const validatedData = AquariumSchema.parse(rawData);

    // Преобразуем пустые строки в null для числовых полей
    const processedData = {
      ...validatedData,
      lengthCm: validatedData.lengthCm === "" ? null : validatedData.lengthCm,
      widthCm: validatedData.widthCm === "" ? null : validatedData.widthCm,
      heightCm: validatedData.heightCm === "" ? null : validatedData.heightCm,
      volumeLiters: validatedData.volumeLiters === "" ? null : validatedData.volumeLiters,
      startDate: validatedData.startDate === "" ? null : validatedData.startDate,
    };

    // Конвертируем единицы измерения если используется имперская система
    const measurementSystem = processedData.measurementSystem || "metric";
    let finalLengthCm = processedData.lengthCm;
    let finalWidthCm = processedData.widthCm;
    let finalHeightCm = processedData.heightCm;
    let finalVolumeLiters = processedData.volumeLiters;

    if (measurementSystem === "imperial") {
      // Конвертируем дюймы в сантиметры
      if (finalLengthCm !== null && finalLengthCm !== undefined) {
        finalLengthCm = measurCalcInch(finalLengthCm, "imperial");
      }
      if (finalWidthCm !== null && finalWidthCm !== undefined) {
        finalWidthCm = measurCalcInch(finalWidthCm, "imperial");
      }
      if (finalHeightCm !== null && finalHeightCm !== undefined) {
        finalHeightCm = measurCalcInch(finalHeightCm, "imperial");
      }
      // Конвертируем галлоны в литры
      if (finalVolumeLiters !== null && finalVolumeLiters !== undefined) {
        finalVolumeLiters = measurCalcGal(finalVolumeLiters, "imperial");
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
      },
    });

    // Обновляем кэш страницы
    revalidatePath("/myTanks");

    return {
      data: aquarium,
      zodErrors: null,
      message: (messages as any).AquariumForm?.successMessage || "Aquarium added successfully!",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Обрабатываем ошибки валидации
      const zodErrors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const field = err.path[0] as string;
        if (!zodErrors[field]) {
          zodErrors[field] = [];
        }
        zodErrors[field].push(err.message);
      });

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