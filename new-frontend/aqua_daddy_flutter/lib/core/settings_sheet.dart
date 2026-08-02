import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:aqua_daddy_flutter/core/settings_provider.dart';
import 'package:aqua_daddy_flutter/core/theme_provider.dart';
import 'package:aqua_daddy_flutter/core/locale_provider.dart';
import 'package:aqua_daddy_flutter/l10n/app_localizations.dart';

void showSettingsSheet(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => const _SettingsSheet(),
  );
}

class _SettingsSheet extends ConsumerWidget {
  const _SettingsSheet();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final settingsAsync = ref.watch(settingsProvider);
    final currentLocale = ref.watch(localeProvider);
    final themeMode = ref.watch(themeModeProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? const Color(0xFF0F2030) : Colors.white;
    final borderColor = isDark
        ? const Color(0xFF1E3A50)
        : const Color(0xFFE2E8F0);
    final titleColor = isDark
        ? const Color(0xFFE2E8F0)
        : const Color(0xFF05222B);

    return Container(
      margin: const EdgeInsets.fromLTRB(12, 0, 12, 12),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: borderColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 24,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  l10n.settings,
                  style: GoogleFonts.tektur(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: titleColor,
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(
                    Icons.close_rounded,
                    color: Color(0xFF6A8A90),
                    size: 22,
                  ),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Theme
            _SettingRow(
              label: l10n.themeLabel,
              isDark: isDark,
              child: _SegmentedToggle(
                options: [l10n.themeSystem, l10n.themeLight, l10n.themeDark],
                selected: themeMode == ThemeMode.system
                    ? 0
                    : themeMode == ThemeMode.light
                    ? 1
                    : 2,
                onChanged: (i) {
                  final modes = [
                    ThemeMode.system,
                    ThemeMode.light,
                    ThemeMode.dark,
                  ];
                  ref.read(themeModeProvider.notifier).setTheme(modes[i]);
                },
                isDark: isDark,
              ),
            ),
            _Divider(isDark: isDark),

            // Measurement system
            _SettingRow(
              label: l10n.measurementSystem,
              isDark: isDark,
              child: settingsAsync.when(
                data: (s) => _SegmentedToggle(
                  options: const ['Metric', 'Imperial'],
                  selected: s.isMetric ? 0 : 1,
                  onChanged: (i) => ref
                      .read(settingsProvider.notifier)
                      .setMeasurement(i == 0),
                  isDark: isDark,
                ),
                loading: () => const SizedBox(
                  width: 140,
                  height: 36,
                  child: Center(
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                ),
                error: (_, __) => const SizedBox(),
              ),
            ),
            _Divider(isDark: isDark),

            // Temperature scale
            _SettingRow(
              label: l10n.temperatureScale,
              isDark: isDark,
              child: settingsAsync.when(
                data: (s) => _SegmentedToggle(
                  options: const ['°C', '°F'],
                  selected: s.isCelsius ? 0 : 1,
                  onChanged: (i) => ref
                      .read(settingsProvider.notifier)
                      .setTemperature(i == 0),
                  isDark: isDark,
                ),
                loading: () => const SizedBox(width: 100, height: 36),
                error: (_, __) => const SizedBox(),
              ),
            ),
            _Divider(isDark: isDark),

            // Language
            _SettingRow(
              label: l10n.language,
              isDark: isDark,
              child: _SegmentedToggle(
                options: const ['EN', 'RU', 'AZ'],
                selected: [
                  'en',
                  'ru',
                  'az',
                ].indexOf(currentLocale.languageCode).clamp(0, 2),
                onChanged: (i) {
                  ref.read(localeProvider.notifier).state = Locale(
                    ['en', 'ru', 'az'][i],
                  );
                },
                isDark: isDark,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SettingRow extends StatelessWidget {
  final String label;
  final Widget child;
  final bool isDark;
  const _SettingRow({
    required this.label,
    required this.child,
    this.isDark = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Flexible(
            child: Text(
              label,
              style: GoogleFonts.montserrat(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: isDark
                    ? const Color(0xFFB0C4D0)
                    : const Color(0xFF05222B),
              ),
            ),
          ),
          const SizedBox(width: 12),
          child,
        ],
      ),
    );
  }
}

class _Divider extends StatelessWidget {
  final bool isDark;
  const _Divider({this.isDark = false});

  @override
  Widget build(BuildContext context) {
    return Divider(
      height: 1,
      color: isDark ? const Color(0xFF1E3A50) : const Color(0xFFE2E8F0),
    );
  }
}

class _SegmentedToggle extends StatelessWidget {
  final List<String> options;
  final int selected;
  final ValueChanged<int> onChanged;
  final bool isDark;

  const _SegmentedToggle({
    required this.options,
    required this.selected,
    required this.onChanged,
    this.isDark = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF162840) : const Color(0xFFEAF9FA),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: List.generate(options.length, (i) {
          final isSelected = i == selected;
          return GestureDetector(
            onTap: () => onChanged(i),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected
                    ? const Color(0xFF00A8D8)
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                options[i],
                style: GoogleFonts.montserrat(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: isSelected
                      ? Colors.white
                      : (isDark
                            ? const Color(0xFF6A8A90)
                            : const Color(0xFF6A8A90)),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}
