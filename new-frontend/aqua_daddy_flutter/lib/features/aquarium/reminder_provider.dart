import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:aqua_daddy_flutter/core/api_client.dart';
import 'package:aqua_daddy_flutter/data/models/reminder.dart';

final remindersProvider =
    AsyncNotifierProvider.family<RemindersNotifier, List<Reminder>, String>(
      RemindersNotifier.new,
    );

class RemindersNotifier extends FamilyAsyncNotifier<List<Reminder>, String> {
  @override
  Future<List<Reminder>> build(String arg) async {
    return _fetchReminders(arg);
  }

  Future<List<Reminder>> _fetchReminders(String aquariumId) async {
    final dio = ref.watch(apiClientProvider);
    final response = await dio.get('/aquariums/$aquariumId/reminders');
    return (response.data as List)
        .map((json) => Reminder.fromJson(json))
        .toList();
  }

  Future<void> addReminder(String title, DateTime remindAt) async {
    final dio = ref.watch(apiClientProvider);
    final aquariumId = arg;

    await dio.post(
      '/aquariums/$aquariumId/reminders',
      data: {'title': title, 'remindAt': remindAt.toIso8601String()},
    );

    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchReminders(aquariumId));
  }

  Future<void> markComplete(String reminderId, bool isCompleted) async {
    final dio = ref.watch(apiClientProvider);
    final aquariumId = arg;

    // Optimistic update
    final current = state.value;
    if (current != null) {
      state = AsyncValue.data(
        current
            .map(
              (r) =>
                  r.id == reminderId ? r.copyWith(isCompleted: isCompleted) : r,
            )
            .toList(),
      );
    }

    try {
      await dio.patch(
        '/aquariums/$aquariumId/reminders/$reminderId',
        data: {'isCompleted': isCompleted},
      );
    } catch (_) {
      // Revert on error
      state = AsyncValue.data(current ?? []);
      rethrow;
    }
  }

  Future<void> deleteReminder(String reminderId) async {
    final dio = ref.watch(apiClientProvider);
    final aquariumId = arg;

    final previous = state.value;
    if (previous != null) {
      state = AsyncValue.data(
        previous.where((r) => r.id != reminderId).toList(),
      );
    }

    try {
      await dio.delete('/aquariums/$aquariumId/reminders/$reminderId');
    } catch (_) {
      if (previous != null) state = AsyncValue.data(previous);
      rethrow;
    }
  }
}
