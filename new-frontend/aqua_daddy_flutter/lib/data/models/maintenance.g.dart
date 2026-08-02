// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'maintenance.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Maintenance _$MaintenanceFromJson(Map<String, dynamic> json) => Maintenance(
      id: json['id'] as String,
      aquariumId: json['aquariumId'] as String,
      performedAt: DateTime.parse(json['performedAt'] as String),
      description: json['description'] as String,
      status: json['status'] as String,
      type: (json['type'] as List<dynamic>).map((e) => e as String).toList(),
    );

Map<String, dynamic> _$MaintenanceToJson(Maintenance instance) =>
    <String, dynamic>{
      'id': instance.id,
      'aquariumId': instance.aquariumId,
      'performedAt': instance.performedAt.toIso8601String(),
      'description': instance.description,
      'status': instance.status,
      'type': instance.type,
    };
