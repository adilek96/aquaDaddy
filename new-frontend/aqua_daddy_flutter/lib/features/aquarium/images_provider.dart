import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:aqua_daddy_flutter/core/api_client.dart';
import 'package:aqua_daddy_flutter/features/dashboard/aquarium_provider.dart';

final aquariumImagesProvider =
    AsyncNotifierProvider.family<AquariumImagesNotifier, void, String>(
      AquariumImagesNotifier.new,
    );

class AquariumImagesNotifier extends FamilyAsyncNotifier<void, String> {
  @override
  Future<void> build(String arg) async {}

  Future<void> addImage(String url) async {
    final dio = ref.watch(apiClientProvider);
    final aquariumId = arg;

    await dio.post('/aquariums/$aquariumId/images', data: {'url': url});

    // Refresh the main aquarium list to show the new image
    ref.invalidate(aquariumsProvider);
    ref.invalidate(aquariumDetailProvider(aquariumId));
  }

  Future<void> deleteImage(String imageId) async {
    final dio = ref.watch(apiClientProvider);
    final aquariumId = arg;

    await dio.delete('/aquariums/$aquariumId/images?imageId=$imageId');

    // Refresh the main aquarium list
    ref.invalidate(aquariumsProvider);
    ref.invalidate(aquariumDetailProvider(aquariumId));
  }
}
