// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'water_log.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

WaterLog _$WaterLogFromJson(Map<String, dynamic> json) => WaterLog(
      id: json['id'] as String,
      aquariumId: json['aquariumId'] as String,
      recordedAt: DateTime.parse(json['recordedAt'] as String),
      ph: (json['pH'] as num?)?.toDouble(),
      temperatureC: (json['temperatureC'] as num?)?.toDouble(),
      no2: (json['NO2'] as num?)?.toDouble(),
      no3: (json['NO3'] as num?)?.toDouble(),
      nh3: (json['NH3'] as num?)?.toDouble(),
      nh4: (json['NH4'] as num?)?.toDouble(),
      po4: (json['PO4'] as num?)?.toDouble(),
      gh: (json['GH'] as num?)?.toDouble(),
      kh: (json['KH'] as num?)?.toDouble(),
      ca: (json['Ca'] as num?)?.toDouble(),
      mg: (json['Mg'] as num?)?.toDouble(),
      k: (json['K'] as num?)?.toDouble(),
      salinity: (json['salinity'] as num?)?.toDouble(),
    );

Map<String, dynamic> _$WaterLogToJson(WaterLog instance) => <String, dynamic>{
      'id': instance.id,
      'aquariumId': instance.aquariumId,
      'recordedAt': instance.recordedAt.toIso8601String(),
      'pH': instance.ph,
      'temperatureC': instance.temperatureC,
      'NO2': instance.no2,
      'NO3': instance.no3,
      'NH3': instance.nh3,
      'NH4': instance.nh4,
      'PO4': instance.po4,
      'GH': instance.gh,
      'KH': instance.kh,
      'Ca': instance.ca,
      'Mg': instance.mg,
      'K': instance.k,
      'salinity': instance.salinity,
    };
