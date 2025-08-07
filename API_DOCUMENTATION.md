# API Документация для управления пользователями

## Настройка

1. Создайте файл `.env.local` в корневой директории проекта
2. Добавьте переменную окружения:
   ```
   ADMIN_TOKEN=your-secure-admin-token-here
   ```
   Замените `your-secure-admin-token-here` на ваш секретный токен.

## API Эндпоинты

### URL для работы с пользователями

```
https://aquadaddy.app/api
```

### 1. GET /api/get-users

Получение списка пользователей с пагинацией и поиском.

#### Заголовки запроса:

```
Authorization: Bearer your-admin-token
```

#### Параметры запроса (query parameters):

- `page` (опционально) - номер страницы (по умолчанию: 1)
- `limit` (опционально) - количество пользователей на странице (по умолчанию: 10)
- `search` (опционально) - поиск по имени или email

#### Пример запроса:

```bash
curl -X GET "http://localhost:3000/api/get-users?page=1&limit=5&search=john" \
  -H "Authorization: Bearer your-admin-token"
```

#### Ответ:

```json
{
  "users": [
    {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "image": "https://example.com/avatar.jpg",
      "country": "Russia",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totalCount": 50
}
```

### 2. DELETE /api/delete-user

Удаление пользователя по ID.

#### Заголовки запроса:

```
Authorization: Bearer your-admin-token
Content-Type: application/json
```

#### Тело запроса:

```json
{
  "userId": "user_id_to_delete"
}
```

#### Пример запроса:

```bash
curl -X DELETE "http://localhost:3000/api/delete-user" \
  -H "Authorization: Bearer your-admin-token" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_id_to_delete"}'
```

#### Ответ:

```json
{
  "message": "User deleted successfully",
  "deletedUser": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

## Коды ошибок

- `401 Unauthorized` - Неверный или отсутствующий токен
- `400 Bad Request` - Отсутствует обязательный параметр
- `404 Not Found` - Пользователь не найден
- `500 Internal Server Error` - Внутренняя ошибка сервера

## Безопасность

- Все API эндпоинты защищены токеном `ADMIN_TOKEN`
- Токен должен передаваться в заголовке `Authorization: Bearer <token>`
- При удалении пользователя удаляются все связанные данные (аквариумы, рейтинги и т.д.) благодаря каскадному удалению в базе данных

## CORS

- Все API эндпоинты поддерживают CORS (Cross-Origin Resource Sharing)
- Разрешены запросы с любых доменов (`Access-Control-Allow-Origin: *`)
- Поддерживаемые методы: GET, POST, PUT, DELETE, OPTIONS
- Разрешенные заголовки: Content-Type, Authorization

## Примеры использования в JavaScript

### Получение пользователей:

```javascript
const response = await fetch("/api/get-users?page=1&limit=10", {
  headers: {
    Authorization: "Bearer your-admin-token",
  },
});
const data = await response.json();
console.log(data.users, data.totalCount);
```

### Удаление пользователя:

```javascript
const response = await fetch("/api/delete-user", {
  method: "DELETE",
  headers: {
    Authorization: "Bearer your-admin-token",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ userId: "user_id_to_delete" }),
});
const data = await response.json();
console.log(data.message);
```
