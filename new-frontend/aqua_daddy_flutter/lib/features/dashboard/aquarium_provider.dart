import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:aqua_daddy_flutter/core/api_client.dart';
import 'package:aqua_daddy_flutter/data/models/aquarium.dart';

final aquariumsProvider = AsyncNotifierProvider<AquariumsNotifier, List<Aquarium>>(
  AquariumsNotifier.new,
);

class AquariumsNotifier extends AsyncNotifier<List<Aquarium>> {
  @override
  Future<List<Aquarium>> build() async {
    return _fetchAquariums();
  }

  Future<List<Aquarium>> _fetchAquariums({String? search}) async {
    final dio = ref.watch(apiClientProvider);
    final response = await dio.get(
      '/aquariums',
      queryParameters: search != null ? {'search': search} : null,
    );
    
    return (response.data as List)
        .map((json) => Aquarium.fromJson(json))
        .toList();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchAquariums());
  }

  Future<void> search(String query) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchAquariums(search: query));
  }

  Future<void> addAquarium(Map<String, dynamic> data) async {
    final dio = ref.read(apiClientProvider);
    await dio.post('/aquariums', data: data);
    await refresh();
  }
}

/// Один аквариум по id. Экран деталей раньше искал его в списке своих
/// аквариумов, поэтому открытие чужого танка из Discovery падало.
final aquariumDetailProvider =
    AsyncNotifierProvider.family<AquariumDetailNotifier, Aquarium, String>(
  AquariumDetailNotifier.new,
);

class AquariumDetailNotifier extends FamilyAsyncNotifier<Aquarium, String> {
  @override
  Future<Aquarium> build(String arg) async {
    return _fetch(arg);
  }

  Future<Aquarium> _fetch(String aquariumId) async {
    final dio = ref.watch(apiClientProvider);
    final response = await dio.get('/aquariums/$aquariumId');
    return Aquarium.fromJson(response.data);
  }

  Future<void> refresh() async {
    state = await AsyncValue.guard(() => _fetch(arg));
  }
}
