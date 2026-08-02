// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'comment.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Comment _$CommentFromJson(Map<String, dynamic> json) => Comment(
      id: json['id'] as String,
      aquariumId: json['aquariumId'] as String,
      userId: json['userId'] as String,
      text: json['text'] as String,
      parentId: json['parentId'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      user: CommentUser.fromJson(json['user'] as Map<String, dynamic>),
      replies: (json['replies'] as List<dynamic>?)
          ?.map((e) => Comment.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$CommentToJson(Comment instance) => <String, dynamic>{
      'id': instance.id,
      'aquariumId': instance.aquariumId,
      'userId': instance.userId,
      'text': instance.text,
      'parentId': instance.parentId,
      'createdAt': instance.createdAt.toIso8601String(),
      'user': instance.user,
      'replies': instance.replies,
    };

CommentUser _$CommentUserFromJson(Map<String, dynamic> json) => CommentUser(
      name: json['name'] as String?,
      image: json['image'] as String?,
    );

Map<String, dynamic> _$CommentUserToJson(CommentUser instance) =>
    <String, dynamic>{
      'name': instance.name,
      'image': instance.image,
    };
