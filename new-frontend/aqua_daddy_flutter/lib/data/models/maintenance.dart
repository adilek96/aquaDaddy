import 'package:json_annotation/json_annotation.dart';

part 'maintenance.g.dart';

@JsonSerializable()
class Maintenance {
  final String id;
  final String aquariumId;
  final DateTime performedAt;
  final String description;
  final String status;
  final List<String> type;

  Maintenance({
    required this.id,
    required this.aquariumId,
    required this.performedAt,
    required this.description,
    required this.status,
    required this.type,
  });

  factory Maintenance.fromJson(Map<String, dynamic> json) => _$MaintenanceFromJson(json);
  Map<String, dynamic> toJson() => _$MaintenanceToJson(this);
}
