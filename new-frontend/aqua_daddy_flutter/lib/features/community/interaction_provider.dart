import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:aqua_daddy_flutter/core/api_client.dart';
import 'package:aqua_daddy_flutter/data/models/comment.dart';
import 'package:aqua_daddy_flutter/data/models/rating.dart';

final aquariumRatingProvider = AsyncNotifierProvider.family<RatingNotifier, AquariumRating, String>(
  RatingNotifier.new,
);

class RatingNotifier extends FamilyAsyncNotifier<AquariumRating, String> {
  @override
  Future<AquariumRating> build(String arg) async {
    return _fetchRating(arg);
  }

  Future<AquariumRating> _fetchRating(String aquariumId) async {
    final dio = ref.watch(apiClientProvider);
    final response = await dio.get('/aquariums/$aquariumId/ratings');
    return AquariumRating.fromJson(response.data);
  }

  Future<void> rate(int value) async {
    final dio = ref.watch(apiClientProvider);
    final aquariumId = arg;
    
    await dio.post('/aquariums/$aquariumId/ratings', data: {
      'value': value,
    });
    
    state = await AsyncValue.guard(() => _fetchRating(aquariumId));
  }
}

final commentsProvider = AsyncNotifierProvider.family<CommentsNotifier, List<Comment>, String>(
  CommentsNotifier.new,
);

class CommentsNotifier extends FamilyAsyncNotifier<List<Comment>, String> {
  @override
  Future<List<Comment>> build(String arg) async {
    return _fetchComments(arg);
  }

  Future<List<Comment>> _fetchComments(String aquariumId) async {
    final dio = ref.watch(apiClientProvider);
    final response = await dio.get('/aquariums/$aquariumId/comments');
    return (response.data as List)
        .map((json) => Comment.fromJson(json))
        .toList();
  }

  Future<void> addComment(String text, {String? parentId}) async {
    final dio = ref.watch(apiClientProvider);
    final aquariumId = arg;
    
    await dio.post('/aquariums/$aquariumId/comments', data: {
      'text': text,
      if (parentId != null) 'parentId': parentId,
    });

    state = await AsyncValue.guard(() => _fetchComments(aquariumId));
  }

  Future<void> deleteComment(String commentId) async {
    final dio = ref.watch(apiClientProvider);
    final aquariumId = arg;

    await dio.delete('/aquariums/$aquariumId/comments?commentId=$commentId');

    state = await AsyncValue.guard(() => _fetchComments(aquariumId));
  }
}
