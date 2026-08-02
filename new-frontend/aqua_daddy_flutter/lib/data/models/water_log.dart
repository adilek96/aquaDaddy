import 'package:json_annotation/json_annotation.dart';

part 'water_log.g.dart';

@JsonSerializable()
class WaterLog {
  final String id;
  final String aquariumId;
  final DateTime recordedAt;
  @JsonKey(name: 'pH')
  final double? ph;
  final double? temperatureC;
  @JsonKey(name: 'NO2')
  final double? no2;
  @JsonKey(name: 'NO3')
  final double? no3;
  @JsonKey(name: 'NH3')
  final double? nh3;
  @JsonKey(name: 'NH4')
  final double? nh4;
  @JsonKey(name: 'PO4')
  final double? po4;
  @JsonKey(name: 'GH')
  final double? gh;
  @JsonKey(name: 'KH')
  final double? kh;
  @JsonKey(name: 'Ca')
  final double? ca;
  @JsonKey(name: 'Mg')
  final double? mg;
  @JsonKey(name: 'K')
  final double? k;
  final double? salinity;

  WaterLog({
    required this.id,
    required this.aquariumId,
    required this.recordedAt,
    this.ph,
    this.temperatureC,
    this.no2,
    this.no3,
    this.nh3,
    this.nh4,
    this.po4,
    this.gh,
    this.kh,
    this.ca,
    this.mg,
    this.k,
    this.salinity,
  });

  factory WaterLog.fromJson(Map<String, dynamic> json) => _$WaterLogFromJson(json);
  Map<String, dynamic> toJson() => _$WaterLogToJson(this);
}
