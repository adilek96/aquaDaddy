import 'package:flutter/foundation.dart';

@immutable
class Aquarium {
  final String id;
  final String userId;
  final String name;
  final String? description;
  final String type;
  final String shape;
  final double? lengthCm;
  final double? widthCm;
  final double? heightCm;
  final double? volumeLiters;
  final DateTime? startDate;
  final bool isPublic;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<AquariumImage> images;
  final WaterParameters? waterParams;

  const Aquarium({
    required this.id,
    required this.userId,
    required this.name,
    this.description,
    required this.type,
    required this.shape,
    this.lengthCm,
    this.widthCm,
    this.heightCm,
    this.volumeLiters,
    this.startDate,
    required this.isPublic,
    required this.createdAt,
    required this.updatedAt,
    this.images = const [],
    this.waterParams,
  });

  factory Aquarium.fromJson(Map<String, dynamic> json) {
    return Aquarium(
      id: json['id'],
      userId: json['userId'],
      name: json['name'],
      description: json['description'],
      type: json['type'],
      shape: json['shape'],
      lengthCm: (json['lengthCm'] as num?)?.toDouble(),
      widthCm: (json['widthCm'] as num?)?.toDouble(),
      heightCm: (json['heightCm'] as num?)?.toDouble(),
      volumeLiters: (json['volumeLiters'] as num?)?.toDouble(),
      startDate: json['startDate'] != null ? DateTime.parse(json['startDate']) : null,
      isPublic: json['isPublic'] ?? false,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      images: (json['images'] as List? ?? [])
          .map((img) => AquariumImage.fromJson(img))
          .toList(),
      waterParams: json['waterParams'] != null 
          ? WaterParameters.fromJson(json['waterParams']) 
          : null,
    );
  }
}

@immutable
class AquariumImage {
  final String id;
  final String url;
  final DateTime uploadedAt;

  const AquariumImage({required this.id, required this.url, required this.uploadedAt});

  factory AquariumImage.fromJson(Map<String, dynamic> json) {
    return AquariumImage(
      id: json['id'],
      url: json['url'],
      uploadedAt: DateTime.parse(json['uploadedAt']),
    );
  }
}

@immutable
class WaterParameters {
  final String id;
  final double? ph; // Renamed from pH
  final double? temperatureC;
  final double? no2;
  final double? no3;
  final double? nh3;
  final DateTime lastUpdated;

  const WaterParameters({
    required this.id, 
    this.ph, 
    this.temperatureC, 
    this.no2,
    this.no3,
    this.nh3,
    required this.lastUpdated,
  });

  factory WaterParameters.fromJson(Map<String, dynamic> json) {
    return WaterParameters(
      id: json['id'],
      ph: (json['ph'] ?? json['pH'] as num?)?.toDouble(),
      temperatureC: (json['temperatureC'] as num?)?.toDouble(),
      no2: (json['no2'] ?? json['NO2'] as num?)?.toDouble(),
      no3: (json['no3'] ?? json['NO3'] as num?)?.toDouble(),
      nh3: (json['nh3'] ?? json['NH3'] as num?)?.toDouble(),
      lastUpdated: DateTime.parse(json['lastUpdated']),
    );
  }
}
