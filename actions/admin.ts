'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Проверка прав внутри самого действия обязательна: server actions —
 * это отдельные эндпоинты, guard в app/admin/layout.tsx на них не распространяется.
 */
async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user || role !== 'ADMIN') {
    throw new Error('Недостаточно прав');
  }
}

export async function deleteAquariumAdmin(id: string) {
  await requireAdmin();

  await prisma.aquarium.delete({
    where: { id },
  });

  revalidatePath('/admin/aquariums');
}

export async function toggleUserStatus(id: string) {
  await requireAdmin();

  // В схеме нет поля для блокировки пользователя (нужна колонка вроде
  // suspendedAt и проверка при входе), поэтому действие пока не выполняется.
  throw new Error(
    `Блокировка пользователей не реализована: в модели User нет поля статуса (id=${id})`
  );
}
