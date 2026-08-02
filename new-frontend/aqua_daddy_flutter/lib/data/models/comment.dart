import 'package:json_annotation/json_annotation.dart';

part 'comment.g.dart';

@JsonSerializable()
class Comment {
  final String id;
  final String aquariumId;
  final String userId;
  final String text;
  final String? parentId;
  final DateTime createdAt;
  final CommentUser user;
  final List<Comment>? replies;

  Comment({
    required this.id,
    required this.aquariumId,
    required this.userId,
    required this.text,
    this.parentId,
    required this.createdAt,
    required this.user,
    this.replies,
  });

  factory Comment.fromJson(Map<String, dynamic> json) => _$CommentFromJson(json);
  Map<String, dynamic> toJson() => _$CommentToJson(this);
}

@JsonSerializable()
class CommentUser {
  final String? name;
  final String? image;

  CommentUser({this.name, this.image});

  factory CommentUser.fromJson(Map<String, dynamic> json) => _$CommentUserFromJson(json);
  Map<String, dynamic> toJson() => _$CommentUserToJson(this);
}
