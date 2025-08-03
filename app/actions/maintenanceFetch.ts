"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateOldPendingMaintenance(tankId: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      throw new Error("User not found");
    }

    const aquarium = await prisma.aquarium.findFirst({
      where: {
        id: tankId,
        userId: user.id,
      }
    });

    if (!aquarium) {
      throw new Error("Aquarium not found or access denied");
    }

    // Получаем текущую дату (начало дня) в UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    console.log("Today (UTC):", today.toISOString());
    console.log("Yesterday (UTC):", yesterday.toISOString());

    // Обновляем все PENDING записи, которые строго старше сегодняшнего дня
    // (не включая сегодняшний день)
    const updatedMaintenance = await prisma.maintenance.updateMany({
      where: {
        aquariumId: tankId,
        status: "PENDING",
        performedAt: {
          lt: yesterday // строго меньше сегодняшнего дня (не включая сегодня)
        }
      },
      data: {
        status: "SKIPPED"
      }
    });

    return { success: true, updatedCount: updatedMaintenance.count };
  } catch (error) {
    console.error("Error updating old pending maintenance:", error);
    return { success: false, error: "Failed to update old pending maintenance" };
  }
}

export async function fetchMaintenanceData(tankId: string) {
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

    // Проверяем права доступа к аквариуму
    const aquarium = await prisma.aquarium.findFirst({
      where: {
        id: tankId,
        userId: user.id,
      }
    });

    if (!aquarium) {
      throw new Error("Aquarium not found or access denied");
    }

    // Сначала обновляем старые PENDING записи на SKIPPED
    // (только записи строго старше сегодняшнего дня)
    await updateOldPendingMaintenance(tankId);

    // Загружаем данные обслуживания
    const maintenanceData = await prisma.maintenance.findMany({
      where: {
        aquariumId: tankId,
      },
      orderBy: {
        performedAt: 'desc'
      },
      include: {
        WaterLog: true
      }
    });

    return { success: true, data: maintenanceData };
  } catch (error) {
    console.error("Error fetching maintenance data:", error);
    return { success: false, error: "Failed to fetch maintenance data" };
  }
}

export async function createMaintenance(data: {
  aquariumId: string;
  type: ("WATER_CHANGE" | "GRAVEL_CLEANING" | "GLASS_CLEANING" | "FILTER_CLEANING" | "PARAMETER_CHECK" | "PLANT_CARE" | "CORAL_CARE" | "SUPPLEMENTS" | "ALGAE_CONTROL" | "OTHER")[];
  description: string;
  performedAt: Date;
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

    // Проверяем права доступа к аквариуму
    const aquarium = await prisma.aquarium.findFirst({
      where: {
        id: data.aquariumId,
        userId: user.id,
      }
    });

    if (!aquarium) {
      throw new Error("Aquarium not found or access denied");
    }



    // Создаем новое обслуживание
    const maintenance = await prisma.maintenance.create({
      data: {
        aquariumId: data.aquariumId,
        type: data.type,
        description: data.description,
        performedAt: data.performedAt,
        status: "PENDING"
      }
    });

    return { success: true, data: maintenance };
  } catch (error) {
    console.error("Error creating maintenance:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create maintenance" };
  }
}

export async function updateMaintenance(data: {
  maintenanceId: string;
  aquariumId: string;
  type?: ("WATER_CHANGE" | "GRAVEL_CLEANING" | "GLASS_CLEANING" | "FILTER_CLEANING" | "PARAMETER_CHECK" | "PLANT_CARE" | "CORAL_CARE" | "SUPPLEMENTS" | "ALGAE_CONTROL" | "OTHER")[];
  description?: string;
  status?: "PENDING" | "COMPLETED" | "CANCELLED" | "SKIPPED";
  waterParameters?: {
    pH?: number | null;
    temperatureC?: number | null;
    KH?: number | null;
    GH?: number | null;
    NH3?: number | null;
    NH4?: number | null;
    NO2?: number | null;
    NO3?: number | null;
    PO4?: number | null;
    K?: number | null;
    Fe?: number | null;
    Mg?: number | null;
    Ca?: number | null;
    salinity?: number | null;
  };
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

    // Проверяем права доступа к аквариуму
    const aquarium = await prisma.aquarium.findFirst({
      where: {
        id: data.aquariumId,
        userId: user.id,
      }
    });

    if (!aquarium) {
      throw new Error("Aquarium not found or access denied");
    }

    // Обновляем обслуживание
    const maintenance = await prisma.maintenance.update({
      where: { id: data.maintenanceId },
      data: {
        ...(data.type && { type: data.type }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status && { status: data.status }),
      }
    });

    // Если есть параметры воды, создаем WaterLog
    if (data.waterParameters) {
      await prisma.waterLog.create({
        data: {
          aquariumId: data.aquariumId,
          maintenanceId: data.maintenanceId,
          recordedAt: new Date(),
          ...data.waterParameters
        }
      });

      // Обновляем параметры воды в аквариуме
      await prisma.waterParameters.upsert({
        where: { aquariumId: data.aquariumId },
        update: data.waterParameters,
        create: {
          aquariumId: data.aquariumId,
          ...data.waterParameters
        }
      });
    }
  
    return { success: true, data: maintenance };
  } catch (error) {
    console.error("Error updating maintenance:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update maintenance" };
  }
} 