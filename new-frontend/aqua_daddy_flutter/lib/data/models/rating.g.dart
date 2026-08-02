// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'rating.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AquariumRating _$AquariumRatingFromJson(Map<String, dynamic> json) =>
    AquariumRating(
      average: (json['average'] as num).toDouble(),
      count: (json['count'] as num).toInt(),
      userRating: (json['userRating'] as num?)?.toInt(),
    );

Map<String, dynamic> _$AquariumRatingToJson(AquariumRating instance) =>
    <String, dynamic>{
      'average': instance.average,
      'count': instance.count,
      'userRating': instance.userRating,
    };
