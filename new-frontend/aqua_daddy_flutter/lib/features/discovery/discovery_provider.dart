import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:aqua_daddy_flutter/core/api_client.dart';
import 'package:aqua_daddy_flutter/data/models/aquarium.dart';

final discoveryProvider = AsyncNotifierProvider<DiscoveryNotifier, List<Aquarium>>(
  DiscoveryNotifier.new,
);

class DiscoveryNotifier extends AsyncNotifier<List<Aquarium>> {
  int _currentSkip = 0;
  bool _hasMore = true;
  String? _lastSearch;

  @override
  Future<List<Aquarium>> build() async {
    _currentSkip = 0;
    _hasMore = true;
    _lastSearch = null;
    return _fetchDiscovery();
  }

  Future<List<Aquarium>> _fetchDiscovery({String? search, int skip = 0}) async {
    final dio = ref.watch(apiClientProvider);
    final response = await dio.get(
      '/discovery',
      queryParameters: {
        if (search != null) 'search': search,
        'skip': skip,
        'take': 20,
      },
    );
    
    final List<Aquarium> results = (response.data as List)
        .map((json) => Aquarium.fromJson(json))
        .toList();
    
    if (results.length < 20) {
      _hasMore = false;
    }

    return results;
  }

  Future<void> loadMore() async {
    if (!_hasMore || state.isLoading) return;

    _currentSkip += 20;
    final currentData = state.value ?? [];
    
    state = const AsyncLoading<List<Aquarium>>().copyWithPrevious(state);
    
    state = await AsyncValue.guard(() async {
      final nextResults = await _fetchDiscovery(search: _lastSearch, skip: _currentSkip);
      return [...currentData, ...nextResults];
    });
  }

  Future<void> refresh() async {
    _currentSkip = 0;
    _hasMore = true;
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchDiscovery(search: _lastSearch));
  }

  Future<void> search(String query) async {
    _lastSearch = query;
    _currentSkip = 0;
    _hasMore = true;
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchDiscovery(search: query));
  }
}
