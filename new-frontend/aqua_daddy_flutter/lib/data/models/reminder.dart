import 'package:json_annotation/json_annotation.dart';

part 'reminder.g.dart';

@JsonSerializable()
class Reminder {
  final String id;
  final String aquariumId;
  final String title;
  final DateTime remindAt;
  final bool isCompleted;

  Reminder({
    required this.id,
    required this.aquariumId,
    required this.title,
    required this.remindAt,
    this.isCompleted = false,
  });

  factory Reminder.fromJson(Map<String, dynamic> json) => _$ReminderFromJson(json);
  Map<String, dynamic> toJson() => _$ReminderToJson(this);

  Reminder copyWith({
    String? id,
    String? aquariumId,
    String? title,
    DateTime? remindAt,
    bool? isCompleted,
  }) {
    return Reminder(
      id: id ?? this.id,
      aquariumId: aquariumId ?? this.aquariumId,
      title: title ?? this.title,
      remindAt: remindAt ?? this.remindAt,
      isCompleted: isCompleted ?? this.isCompleted,
    );
  }
}
