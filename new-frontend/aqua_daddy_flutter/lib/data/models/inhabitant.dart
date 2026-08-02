import 'package:json_annotation/json_annotation.dart';

part 'inhabitant.g.dart';

@JsonSerializable()
class Inhabitant {
  final String id;
  final String aquariumId;
  final String species;
  final int count;
  final DateTime addedAt;

  Inhabitant({
    required this.id,
    required this.aquariumId,
    required this.species,
    required this.count,
    required this.addedAt,
  });

  factory Inhabitant.fromJson(Map<String, dynamic> json) => _$InhabitantFromJson(json);
  Map<String, dynamic> toJson() => _$InhabitantToJson(this);
}
