import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:aqua_daddy_flutter/core/api_client.dart';
import 'package:aqua_daddy_flutter/data/models/maintenance.dart';

/// Типы работ — значения enum MaintenanceType в схеме Prisma.
enum MaintenanceKind {
  waterChange('WATER_CHANGE'),
  gravelCleaning('GRAVEL_CLEANING'),
  glassCleaning('GLASS_CLEANING'),
  filterCleaning('FILTER_CLEANING'),
  parameterCheck('PARAMETER_CHECK'),
  plantCare('PLANT_CARE'),
  coralCare('CORAL_CARE'),
  supplements('SUPPLEMENTS'),
  algaeControl('ALGAE_CONTROL'),
  other('OTHER');

  const MaintenanceKind(this.apiValue);
  final String apiValue;
}

/// Статусы — значения enum MaintenanceStatus.
enum MaintenanceState {
  completed('COMPLETED'),
  pending('PENDING'),
  skipped('SKIPPED'),
  cancelled('CANCELLED');

  const MaintenanceState(this.apiValue);
  final String apiValue;
}

final maintenanceProvider =
    AsyncNotifierProvider.family<
      MaintenanceNotifier,
      List<Maintenance>,
      String
    >(MaintenanceNotifier.new);

class MaintenanceNotifier
    extends FamilyAsyncNotifier<List<Maintenance>, String> {
  @override
  Future<List<Maintenance>> build(String arg) async {
    return _fetchMaintenance(arg);
  }

  Future<List<Maintenance>> _fetchMaintenance(String aquariumId) async {
    final dio = ref.watch(apiClientProvider);
    final response = await dio.get('/aquariums/$aquariumId/maintenance');
    return (response.data as List)
        .map((json) => Maintenance.fromJson(json))
        .toList();
  }

  Future<void> addMaintenance(
    String description, {
    List<MaintenanceKind> types = const [MaintenanceKind.other],
    DateTime? performedAt,
    MaintenanceState status = MaintenanceState.completed,
  }) async {
    final dio = ref.watch(apiClientProvider);
    final aquariumId = arg;

    await dio.post(
      '/aquariums/$aquariumId/maintenance',
      data: {
        'description': description,
        'performedAt': (performedAt ?? DateTime.now()).toIso8601String(),
        'status': status.apiValue,
        'type': types.map((t) => t.apiValue).toList(),
      },
    );

    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchMaintenance(aquariumId));
  }

  Future<void> updateStatus(
    String maintenanceId,
    MaintenanceState status,
  ) async {
    final dio = ref.watch(apiClientProvider);
    final aquariumId = arg;

    await dio.patch(
      '/aquariums/$aquariumId/maintenance/$maintenanceId',
      data: {'status': status.apiValue},
    );

    state = await AsyncValue.guard(() => _fetchMaintenance(aquariumId));
  }

  Future<void> deleteMaintenance(String maintenanceId) async {
    final dio = ref.watch(apiClientProvider);
    final aquariumId = arg;

    final previous = state.value;
    if (previous != null) {
      state = AsyncValue.data(
        previous.where((m) => m.id != maintenanceId).toList(),
      );
    }

    try {
      await dio.delete('/aquariums/$aquariumId/maintenance/$maintenanceId');
    } catch (_) {
      if (previous != null) state = AsyncValue.data(previous);
      rethrow;
    }
  }
}
