"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// Обновление описания аквариума
export async function updateAquariumDescription(tankId: string, description: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error("Unauthorized");
    }

    // Получаем пользователя по email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      throw new Error("User not found");
    }

    const updatedAquarium = await prisma.aquarium.update({
      where: {
        id: tankId,
        userId: user.id, // Используем ID пользователя, а не email
      },
      data: {
        description,
      },
      include: {
        waterParams: true,
        inhabitants: true,
        reminders: true,
      }
    });

    return { success: true, data: updatedAquarium };
  } catch (error) {
    console.error("Error updating aquarium description:", error);
    return { success: false, error: "Failed to update description" };
  }
}

// Обновление спецификаций аквариума
export async function updateAquariumSpecifications(tankId: string, specifications: {
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  diameterCm?: number;
  sideCm?: number;
  depthCm?: number;
  volumeLiters?: number;
  k?: number;
}) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error("Unauthorized");
    }

    // Получаем пользователя по email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      throw new Error("User not found");
    }

    const updatedAquarium = await prisma.aquarium.update({
      where: {
        id: tankId,
        userId: user.id, // Используем ID пользователя
      },
      data: specifications,
      include: {
        waterParams: true,
        inhabitants: true,
        reminders: true,
      }
    });

    return { success: true, data: updatedAquarium };
  } catch (error) {
    console.error("Error updating aquarium specifications:", error);
    return { success: false, error: "Failed to update specifications" };
  }
}

// Обновление параметров воды аквариума
export async function updateWaterParameters(tankId: string, waterParameters: {
  pH?: number;
  temperatureC?: number;
  KH?: number;
  GH?: number;
  NH3?: number;
  NH4?: number;
  NO2?: number;
  NO3?: number;
  PO4?: number;
  K?: number;
  Fe?: number;
  Mg?: number;
  Ca?: number;
  salinity?: number;
}) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error("Unauthorized");
    }

    // Получаем пользователя по email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      throw new Error("User not found");
    }

    const updatedWaterParams = await prisma.waterParameters.upsert({
      where: { aquariumId: tankId },
      update: {
        ...waterParameters,
        lastUpdated: new Date(),
      },
      create: {
        aquariumId: tankId,
        ...waterParameters,
        lastUpdated: new Date(),
      },
    });

    return { success: true, data: updatedWaterParams };
  } catch (error) {
    console.error("Error updating water parameters:", error);
    return { success: false, error: "Failed to update water parameters" };
  }
}

// Обновление контента аквариума
export async function updateAquariumContent(tankId: string, content: {
  inhabitants?: string;
  reminders?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error("Unauthorized");
    }

    // Получаем пользователя по email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Функция для парсинга обитателей
    const parseInhabitants = (inhabitantsStr: string) => {
      const inhabitants: Array<{species: string, count: number}> = [];
      const pairs = inhabitantsStr.split(',').map(pair => pair.trim());
      
      pairs.forEach(pair => {
        const match = pair.match(/^(.+?)\s*\((\d+)\)$/);
        if (match) {
          inhabitants.push({
            species: match[1].trim(),
            count: parseInt(match[2])
          });
        } else if (pair.trim()) {
          inhabitants.push({
            species: pair.trim(),
            count: 1
          });
        }
      });
      
      return inhabitants;
    };

    // Обновляем аквариум с транзакцией для всех связанных данных
    const updatedAquarium = await prisma.$transaction(async (tx) => {
      // Обновляем обитателей
      if (content.inhabitants !== undefined) {
        // Удаляем старых обитателей
        await tx.inhabitant.deleteMany({
          where: { aquariumId: tankId }
        });

        // Если есть новые обитатели, создаем записи
        if (content.inhabitants.trim()) {
          const inhabitants = parseInhabitants(content.inhabitants);
          for (const inhabitant of inhabitants) {
            await tx.inhabitant.create({
              data: {
                aquariumId: tankId,
                species: inhabitant.species,
                count: inhabitant.count,
              }
            });
          }
        }
      }

      // Обновляем напоминания
      if (content.reminders !== undefined) {
        // Удаляем старые напоминания
        await tx.reminder.deleteMany({
          where: { aquariumId: tankId }
        });

        // Если есть новые напоминания, создаем запись
        if (content.reminders.trim()) {
          await tx.reminder.create({
            data: {
              aquariumId: tankId,
              title: content.reminders,
              remindAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Завтра по умолчанию
              isCompleted: false,
            }
          });
        }
      }

      // Возвращаем обновленный аквариум с связанными данными
      return await tx.aquarium.findUnique({
        where: { id: tankId },
        include: {
          waterParams: true,
          inhabitants: true,
          reminders: true,
        }
      });
    });

    return { success: true, data: updatedAquarium };
  } catch (error) {
    console.error("Error updating aquarium content:", error);
    return { success: false, error: "Failed to update content" };
  }
}

// Обновление временной шкалы аквариума
export async function updateAquariumTimeline(tankId: string, startDate: string) {
  const startDateSchema = z.object({
    startDate: z.string().optional().or(z.literal("")).refine((val: string | undefined) => {
      if (!val) return true; // если пустая строка или undefined — валидно
      const date = new Date(val);
      const now = new Date();
      return !isNaN(date.getTime()) && date <= now;
    }, "415-22"),
  });

  try {
    // Валидируем входные данные
    const validatedData = startDateSchema.parse({ startDate });

    const session = await auth();
    if (!session?.user?.email) {
      throw new Error("Unauthorized");
    }

    // Получаем пользователя по email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      throw new Error("User not found");
    }

    const updatedAquarium = await prisma.aquarium.update({
      where: {
        id: tankId,
        userId: user.id, // Используем ID пользователя, а не email
      },
      data: {
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
      },
      include: {
        waterParams: true,
        inhabitants: true,
        reminders: true,
      }
    });

    return { success: true, data: updatedAquarium };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      console.error("Zod validation errors:", error.errors);
      return { 
        success: false, 
        error: "Invalid date format or date is in the future",
        zodErrors: error.errors 
      };
    }
    
    console.error("Error updating aquarium timeline:", error);
    return { success: false, error: "Failed to update timeline" };
  }
}

// Обновление обзора аквариума
export async function updateAquariumOverview(tankId: string, overview: {
  type?: "FRESHWATER" | "SALTWATER" | "PALUDARIUM";
  shape?: string;
  isPublic?: boolean;
}) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error("Unauthorized");
    }

    // Получаем пользователя по email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Подготавливаем данные для обновления, исключая пустые значения
    const updateData: any = {};
    
    if (overview.type) {
      updateData.type = overview.type;
    }
    
    if (overview.shape && overview.shape !== "") {
      updateData.shape = overview.shape;
    }
    
    if (typeof overview.isPublic === 'boolean') {
      updateData.isPublic = overview.isPublic;
    }

    const updatedAquarium = await prisma.aquarium.update({
      where: {
        id: tankId,
        userId: user.id, // Используем ID пользователя, а не email
      },
      data: updateData,
      include: {
        waterParams: true,
        inhabitants: true,
        reminders: true,
      }
    });

    return { success: true, data: updatedAquarium };
  } catch (error) {
    console.error("Error updating aquarium overview:", error);
    return { success: false, error: "Failed to update overview" };
  }
} 

 