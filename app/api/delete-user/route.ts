import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  // Добавляем CORS заголовки
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Обрабатываем preflight запросы
  if (request.method === 'OPTIONS') {
    return response;
  }
  try {
    // Проверяем токен авторизации
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || token !== process.env.ADMIN_TOKEN) {
      const unauthorizedResponse = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
      
      // Добавляем CORS заголовки к ответу об ошибке авторизации
      unauthorizedResponse.headers.set('Access-Control-Allow-Origin', '*');
      unauthorizedResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      unauthorizedResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return unauthorizedResponse;
    }

    // Получаем ID пользователя из тела запроса
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      const badRequestResponse = NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
      
      // Добавляем CORS заголовки к ответу об ошибке валидации
      badRequestResponse.headers.set('Access-Control-Allow-Origin', '*');
      badRequestResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      badRequestResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return badRequestResponse;
    }

    // Проверяем существование пользователя
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!existingUser) {
      const notFoundResponse = NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
      
      // Добавляем CORS заголовки к ответу об ошибке "не найдено"
      notFoundResponse.headers.set('Access-Control-Allow-Origin', '*');
      notFoundResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      notFoundResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return notFoundResponse;
    }

    // Удаляем пользователя (каскадное удаление настроено в схеме)
    await prisma.user.delete({
      where: { id: userId },
    });

    const jsonResponse = NextResponse.json({
      message: 'User deleted successfully',
      deletedUser: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
      },
    });
    
    // Добавляем CORS заголовки к ответу
    jsonResponse.headers.set('Access-Control-Allow-Origin', '*');
    jsonResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    jsonResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return jsonResponse;
  } catch (error) {
    console.error('Error deleting user:', error);
    const errorResponse = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    
    // Добавляем CORS заголовки к ответу об ошибке
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return errorResponse;
  }
}
