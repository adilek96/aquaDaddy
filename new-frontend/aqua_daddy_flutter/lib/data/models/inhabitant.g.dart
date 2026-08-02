// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'inhabitant.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Inhabitant _$InhabitantFromJson(Map<String, dynamic> json) => Inhabitant(
      id: json['id'] as String,
      aquariumId: json['aquariumId'] as String,
      species: json['species'] as String,
      count: (json['count'] as num).toInt(),
      addedAt: DateTime.parse(json['addedAt'] as String),
    );

Map<String, dynamic> _$InhabitantToJson(Inhabitant instance) =>
    <String, dynamic>{
      'id': instance.id,
      'aquariumId': instance.aquariumId,
      'species': instance.species,
      'count': instance.count,
      'addedAt': instance.addedAt.toIso8601String(),
    };
