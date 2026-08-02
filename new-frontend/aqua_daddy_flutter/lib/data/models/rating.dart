import 'package:json_annotation/json_annotation.dart';

part 'rating.g.dart';

@JsonSerializable()
class AquariumRating {
  final double average;
  final int count;
  final int? userRating;

  AquariumRating({
    required this.average,
    required this.count,
    this.userRating,
  });

  factory AquariumRating.fromJson(Map<String, dynamic> json) => _$AquariumRatingFromJson(json);
  Map<String, dynamic> toJson() => _$AquariumRatingToJson(this);
}
