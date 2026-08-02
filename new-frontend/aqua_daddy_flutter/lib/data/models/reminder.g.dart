// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'reminder.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Reminder _$ReminderFromJson(Map<String, dynamic> json) => Reminder(
      id: json['id'] as String,
      aquariumId: json['aquariumId'] as String,
      title: json['title'] as String,
      remindAt: DateTime.parse(json['remindAt'] as String),
      isCompleted: json['isCompleted'] as bool? ?? false,
    );

Map<String, dynamic> _$ReminderToJson(Reminder instance) => <String, dynamic>{
      'id': instance.id,
      'aquariumId': instance.aquariumId,
      'title': instance.title,
      'remindAt': instance.remindAt.toIso8601String(),
      'isCompleted': instance.isCompleted,
    };
