import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:aqua_daddy_flutter/core/countries.dart';

/// Флаг страны по коду ISO alpha-2 с подписью-кодом рядом.
/// Используется и в профиле, и на карточках публичных аквариумов —
/// страна показывается «по коду и флагу».
class CountryFlag extends StatelessWidget {
  final String code;
  final double height;
  final bool showCode;
  final TextStyle? codeStyle;

  const CountryFlag({
    super.key,
    required this.code,
    this.height = 14,
    this.showCode = true,
    this.codeStyle,
  });

  @override
  Widget build(BuildContext context) {
    final upper = code.toUpperCase();
    final flag = ClipRRect(
      borderRadius: BorderRadius.circular(2),
      child: CachedNetworkImage(
        imageUrl: countryFlagUrl(code),
        height: height,
        width: height * 4 / 3,
        fit: BoxFit.cover,
        // Пока флаг грузится или если не загрузился — место под него не прыгает
        placeholder: (_, __) => SizedBox(height: height, width: height * 4 / 3),
        errorWidget: (_, __, ___) =>
            SizedBox(height: height, width: height * 4 / 3),
      ),
    );

    if (!showCode) return flag;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        flag,
        const SizedBox(width: 5),
        Text(
          upper,
          style: codeStyle ??
              const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: Color(0xFF6A8A90),
              ),
        ),
      ],
    );
  }
}
