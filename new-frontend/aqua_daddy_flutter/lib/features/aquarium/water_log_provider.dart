import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:aqua_daddy_flutter/core/api_client.dart';
import 'package:aqua_daddy_flutter/data/models/water_log.dart';

final waterLogsProvider =
    AsyncNotifierProvider.family<WaterLogsNotifier, List<WaterLog>, String>(
      WaterLogsNotifier.new,
    );

class WaterLogsNotifier extends FamilyAsyncNotifier<List<WaterLog>, String> {
  @override
  Future<List<WaterLog>> build(String arg) async {
    return _fetchLogs(arg);
  }

  Future<List<WaterLog>> _fetchLogs(String aquariumId) async {
    final dio = ref.watch(apiClientProvider);
    final response = await dio.get('/aquariums/$aquariumId/logs');
    return (response.data as List)
        .map((json) => WaterLog.fromJson(json))
        .toList();
  }

  Future<void> addLog(Map<String, dynamic> data) async {
    final dio = ref.watch(apiClientProvider);
    final aquariumId = arg;

    await dio.post('/aquariums/$aquariumId/logs', data: data);

    // Refresh the logs list
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchLogs(aquariumId));
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchLogs(arg));
  }
}
