import 'package:dio/dio.dart';
import 'package:flutter/material.dart';

/// Достаёт из ошибки Dio текст, который можно показать пользователю.
/// Бэкенд отвечает `{"error": "..."}`, но при обрыве связи тела нет вовсе.
String apiErrorMessage(Object error) {
  if (error is DioException) {
    final data = error.response?.data;

    if (data is Map && data['error'] is String) {
      return data['error'] as String;
    }
    if (data is String && data.trim().isNotEmpty) {
      return data;
    }

    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return 'Сервер не отвечает. Проверьте соединение.';
      case DioExceptionType.connectionError:
        return 'Нет связи с сервером.';
      default:
        final code = error.response?.statusCode;
        return code != null
            ? 'Ошибка сервера ($code)'
            : 'Не удалось выполнить запрос';
    }
  }

  return error.toString();
}

/// Выполняет мутацию и показывает результат пользователю.
/// Без этого неуспешные запросы проваливались молча: UI просто не менялся.
Future<bool> runWithFeedback(
  BuildContext context,
  Future<void> Function() action, {
  String? successMessage,
}) async {
  final messenger = ScaffoldMessenger.of(context);

  try {
    await action();
    if (successMessage != null) {
      messenger.showSnackBar(
        SnackBar(
          content: Text(successMessage),
          duration: const Duration(seconds: 2),
        ),
      );
    }
    return true;
  } catch (error) {
    messenger.showSnackBar(
      SnackBar(
        content: Text(apiErrorMessage(error)),
        backgroundColor: Colors.red.shade700,
        duration: const Duration(seconds: 4),
      ),
    );
    return false;
  }
}
