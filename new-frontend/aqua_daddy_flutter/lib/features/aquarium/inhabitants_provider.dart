import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:aqua_daddy_flutter/core/api_client.dart';
import 'package:aqua_daddy_flutter/data/models/inhabitant.dart';

final inhabitantsProvider =
    AsyncNotifierProvider.family<InhabitantsNotifier, List<Inhabitant>, String>(
      InhabitantsNotifier.new,
    );

class InhabitantsNotifier
    extends FamilyAsyncNotifier<List<Inhabitant>, String> {
  @override
  Future<List<Inhabitant>> build(String arg) async {
    return _fetchInhabitants(arg);
  }

  Future<List<Inhabitant>> _fetchInhabitants(String aquariumId) async {
    final dio = ref.watch(apiClientProvider);
    final response = await dio.get('/aquariums/$aquariumId/inhabitants');
    return (response.data as List)
        .map((json) => Inhabitant.fromJson(json))
        .toList();
  }

  Future<void> addInhabitant(String species, int count) async {
    final dio = ref.watch(apiClientProvider);
    final aquariumId = arg;

    await dio.post(
      '/aquariums/$aquariumId/inhabitants',
      data: {'species': species, 'count': count},
    );

    // Refresh the inhabitants list
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchInhabitants(aquariumId));
  }

  Future<void> deleteInhabitant(String inhabitantId) async {
    final dio = ref.watch(apiClientProvider);
    final aquariumId = arg;

    final previous = state.value;
    // Убираем сразу, чтобы список не мигал; при ошибке возвращаем обратно
    if (previous != null) {
      state = AsyncValue.data(
        previous.where((i) => i.id != inhabitantId).toList(),
      );
    }

    try {
      await dio.delete(
        '/aquariums/$aquariumId/inhabitants?inhabitantId=$inhabitantId',
      );
    } catch (_) {
      if (previous != null) state = AsyncValue.data(previous);
      rethrow;
    }
  }
}
