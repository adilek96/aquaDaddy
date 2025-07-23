"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { getMessages } from "next-intl/server";
import { measurCalcInch } from "@/components/helpers/measurCalcInch";
import { measurCalcGal } from "@/components/helpers/mesurCalcGal";

// Схема валидации для формы обновления аквариума
const AquariumUpdateSchema = z.object({
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
  startDate: z.string().optional().or(z.literal("")),
  measurementSystem: z.string().optional(),
  // Дополнительные поля для разных форм аквариума
  diameterCm: z.string().transform((val) => val === "" ? null : Number(val)).pipe(z.number().positive().nullable()),
  sideCm: z.string().transform((val) => val === "" ? null : Number(val)).pipe(z.number().positive().nullable()),
  depthCm: z.string().transform((val) => val === "" ? null : Number(val)).pipe(z.number().positive().nullable()),
  k: z.string().transform((val) => val === "" ? null : Number(val)).pipe(z.number().positive().nullable()),
  aquariumId: z.string().min(1, "Aquarium ID is required"),
});

type FormState = {
  data: any;
  zodErrors: Record<string, string[]> | null;
  message: string | null;
  success?: boolean;
};

export async function aquariumUpdateAction(
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
        message: (messages as any).AquariumForm?.loginRequired || "You must be logged in to update an aquarium",
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
      aquariumId: formData.get("aquariumId") || "",
    };

    const validatedData = AquariumUpdateSchema.parse(rawData);

    // Проверяем, что аквариум принадлежит пользователю
    const existingAquarium = await prisma.aquarium.findFirst({
      where: {
        id: validatedData.aquariumId,
        userId: session.user.id,
      },
    });

    if (!existingAquarium) {
      return {
        data: null,
        zodErrors: null,
        message: (messages as any).AquariumForm?.notFound || "Aquarium not found or you don't have permission to edit it",
      };
    }

    // Конвертируем единицы измерения если используется имперская система
    const measurementSystem = validatedData.measurementSystem || "metric";
    let finalLengthCm = validatedData.lengthCm;
    let finalWidthCm = validatedData.widthCm;
    let finalHeightCm = validatedData.heightCm;
    let finalVolumeLiters = validatedData.volumeLiters;
    let finalDiameterCm = validatedData.diameterCm;
    let finalSideCm = validatedData.sideCm;
    let finalDepthCm = validatedData.depthCm;
    let finalK = validatedData.k;

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
      if (finalVolumeLiters !== null && finalVolumeLiters !== undefined) {
        finalVolumeLiters = finalVolumeLiters * 3.78541;
      }
    }

    // Обновляем аквариум в базе данных
    const updatedAquarium = await prisma.aquarium.update({
      where: {
        id: validatedData.aquariumId,
      },
      data: {
        name: validatedData.name,
        type: validatedData.type,
        shape: validatedData.shape,
        description: validatedData.description || null,
        lengthCm: finalLengthCm,
        widthCm: finalWidthCm,
        heightCm: finalHeightCm,
        volumeLiters: finalVolumeLiters,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        // Дополнительные поля для разных форм
        diameterCm: finalDiameterCm,
        sideCm: finalSideCm,
        depthCm: finalDepthCm,
        k: finalK,
      },
    });

    // Обновляем кэш страниц
    revalidatePath("/myTanks");
    revalidatePath(`/myTanks/${validatedData.aquariumId}`);

    return {
      data: updatedAquarium,
      zodErrors: null,
      message: (messages as any).AquariumForm?.updateSuccessMessage || "Aquarium updated successfully!",
      success: true,
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
    console.error("Error updating aquarium:", error);
    return {
      data: null,
      zodErrors: null,
      message: (messages as any).AquariumForm?.updateTryAgain || "Failed to update aquarium. Please try again.",
    };
  }
} 