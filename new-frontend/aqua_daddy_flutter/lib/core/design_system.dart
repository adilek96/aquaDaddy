import 'package:flutter/material.dart';

Color _hsl(double h, double sPercent, double lPercent) {
  return HSLColor.fromAHSL(
    1.0,
    h,
    sPercent / 100.0,
    lPercent / 100.0,
  ).toColor();
}

// Light theme colors (values taken from app/globals.css CSS variables)
final Color dsLightBackground = _hsl(0, 0, 100); // --background: 0 0% 100%
final Color dsLightForeground = _hsl(222.2, 84, 4.9); // --foreground
final Color dsLightCard = _hsl(0, 0, 100);
final Color dsLightCardForeground = _hsl(222.2, 84, 4.9);
final Color dsLightPrimary = _hsl(222.2, 47.4, 11.2);
final Color dsLightPrimaryForeground = _hsl(210, 40, 98);
final Color dsLightSecondary = _hsl(210, 40, 96.1);
final Color dsLightSecondaryForeground = _hsl(222.2, 47.4, 11.2);
final Color dsLightMuted = _hsl(210, 40, 96.1);
final Color dsLightMutedForeground = _hsl(215.4, 16.3, 46.9);
final Color dsLightAccent = _hsl(210, 40, 96.1);
final Color dsLightAccentForeground = _hsl(222.2, 47.4, 11.2);
final Color dsLightDestructive = _hsl(0, 84.2, 60.2);
final Color dsLightBorder = _hsl(214.3, 31.8, 91.4);
final Color dsLightInput = _hsl(214.3, 31.8, 91.4);
final Color dsLightRing = _hsl(222.2, 84, 4.9);

// Dark theme colors (values from .dark in globals.css)
final Color dsDarkBackground = _hsl(222.2, 84, 4.9);
final Color dsDarkForeground = _hsl(210, 40, 98);
final Color dsDarkCard = _hsl(222.2, 84, 4.9);
final Color dsDarkCardForeground = _hsl(210, 40, 98);
final Color dsDarkPrimary = _hsl(210, 40, 98);
final Color dsDarkPrimaryForeground = _hsl(222.2, 47.4, 11.2);
final Color dsDarkSecondary = _hsl(217.2, 32.6, 17.5);
final Color dsDarkSecondaryForeground = _hsl(210, 40, 98);
final Color dsDarkMuted = _hsl(217.2, 32.6, 17.5);
final Color dsDarkMutedForeground = _hsl(215, 20.2, 65.1);
final Color dsDarkAccent = _hsl(217.2, 32.6, 17.5);
final Color dsDarkAccentForeground = _hsl(210, 40, 98);
final Color dsDarkDestructive = _hsl(0, 62.8, 30.6);
final Color dsDarkBorder = _hsl(217.2, 32.6, 17.5);
final Color dsDarkInput = _hsl(217.2, 32.6, 17.5);
final Color dsDarkRing = _hsl(212.7, 26.8, 83.9);

// Expose ColorSchemes for ThemeData
final ColorScheme dsLightColorScheme = ColorScheme(
  brightness: Brightness.light,
  primary: dsLightPrimary,
  onPrimary: dsLightPrimaryForeground,
  secondary: dsLightSecondary,
  onSecondary: dsLightSecondaryForeground,
  error: dsLightDestructive,
  onError: dsLightPrimaryForeground,
  // background/onBackground убраны: они объявлены устаревшими и больше
  // не читаются виджетами, роль фона выполняет surface
  surface: dsLightCard,
  onSurface: dsLightCardForeground,
  tertiary: dsLightAccent,
  onTertiary: dsLightAccentForeground,
);

final ColorScheme dsDarkColorScheme = ColorScheme(
  brightness: Brightness.dark,
  primary: dsDarkPrimary,
  onPrimary: dsDarkPrimaryForeground,
  secondary: dsDarkSecondary,
  onSecondary: dsDarkSecondaryForeground,
  error: dsDarkDestructive,
  onError: dsDarkPrimaryForeground,
  surface: dsDarkCard,
  onSurface: dsDarkCardForeground,
  tertiary: dsDarkAccent,
  onTertiary: dsDarkAccentForeground,
);
