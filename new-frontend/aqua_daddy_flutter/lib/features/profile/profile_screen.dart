import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import 'package:aqua_daddy_flutter/features/auth/auth_provider.dart';
import 'package:aqua_daddy_flutter/core/locale_provider.dart';
import 'package:aqua_daddy_flutter/core/app_header.dart';
import 'package:aqua_daddy_flutter/l10n/app_localizations.dart';
import 'package:aqua_daddy_flutter/features/dashboard/aquarium_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final authState = ref.watch(authProvider);
    final currentLocale = ref.watch(localeProvider);
    final aquariumsAsync = ref.watch(aquariumsProvider);
    final user = authState.user;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF0F2030) : const Color(0xFFEAF9FA);
    final titleColor = isDark ? const Color(0xFFE2E8F0) : const Color(0xFF05222B);
    final dividerColor = isDark ? const Color(0xFF1E3A50) : const Color(0xFFD0EFF5);

    final name = user?['name'] as String? ?? 'aquaDaddy User';
    final email = user?['email'] as String? ?? '';
    final image = user?['image'] as String?;

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: const AppHeader(),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                l10n.profile,
                style: GoogleFonts.tektur(fontSize: 28, color: titleColor),
              ),
              const SizedBox(height: 24),

              // User card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 14, offset: const Offset(0, 6)),
                  ],
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 34,
                      backgroundColor: const Color(0xFF00A8D8).withValues(alpha: 0.12),
                      backgroundImage: image != null ? NetworkImage(image) : null,
                      child: image == null
                          ? Text(
                              name.isNotEmpty ? name[0].toUpperCase() : 'A',
                              style: GoogleFonts.tektur(fontSize: 30, color: const Color(0xFF00A8D8)),
                            )
                          : null,
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            name,
                            style: GoogleFonts.tektur(fontSize: 22, color: titleColor),
                            overflow: TextOverflow.ellipsis,
                          ),
                          if (email.isNotEmpty)
                            Text(
                              email,
                              style: GoogleFonts.montserrat(fontSize: 12, color: const Color(0xFF6A8A90)),
                              overflow: TextOverflow.ellipsis,
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              // Aquarium count stat
              aquariumsAsync.when(
                data: (aquariums) => _StatCard(
                  icon: Icons.waves,
                  label: l10n.myTanks,
                  value: '${aquariums.length}',
                ),
                loading: () => const SizedBox.shrink(),
                error: (_, __) => const SizedBox.shrink(),
              ),
              const SizedBox(height: 24),

              // Language section
              _SectionLabel(label: l10n.language),
              const SizedBox(height: 8),
              Container(
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 4)),
                  ],
                ),
                child: Column(
                  children: [
                    _LocaleTile(
                      label: 'English',
                      code: 'en',
                      current: currentLocale,
                      isDark: isDark,
                      onTap: () => ref.read(localeProvider.notifier).state = const Locale('en'),
                    ),
                    Divider(height: 1, indent: 16, endIndent: 16, color: dividerColor),
                    _LocaleTile(
                      label: 'Русский',
                      code: 'ru',
                      current: currentLocale,
                      isDark: isDark,
                      onTap: () => ref.read(localeProvider.notifier).state = const Locale('ru'),
                    ),
                    Divider(height: 1, indent: 16, endIndent: 16, color: dividerColor),
                    _LocaleTile(
                      label: 'Azərbaycan',
                      code: 'az',
                      current: currentLocale,
                      isDark: isDark,
                      onTap: () => ref.read(localeProvider.notifier).state = const Locale('az'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Logout button
              GestureDetector(
                onTap: () async {
                  await ref.read(authProvider.notifier).logout();
                  if (context.mounted) context.go('/');
                },
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF2A1010) : const Color(0xFFFFECEC),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: isDark ? const Color(0xFF5C1A1A) : const Color(0xFFFFCDD2)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.logout_rounded, color: Color(0xFFE53935), size: 20),
                      const SizedBox(width: 8),
                      Text(
                        l10n.logout,
                        style: GoogleFonts.montserrat(
                          fontWeight: FontWeight.w600,
                          fontSize: 15,
                          color: const Color(0xFFE53935),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _StatCard({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F2030) : const Color(0xFFEAF9FA),
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 4)),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: const Color(0xFF00A8D8).withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: const Color(0xFF00A8D8), size: 22),
          ),
          const SizedBox(width: 14),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value, style: GoogleFonts.tektur(fontSize: 26, color: isDark ? const Color(0xFFE2E8F0) : const Color(0xFF05222B))),
              Text(label, style: GoogleFonts.montserrat(fontSize: 12, color: const Color(0xFF6A8A90))),
            ],
          ),
        ],
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String label;
  const _SectionLabel({required this.label});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Text(
        label.toUpperCase(),
        style: GoogleFonts.montserrat(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: const Color(0xFF6A8A90),
          letterSpacing: 1.2,
        ),
      ),
    );
  }
}

class _LocaleTile extends StatelessWidget {
  final String label;
  final String code;
  final Locale current;
  final VoidCallback onTap;
  final bool isDark;
  const _LocaleTile({
    required this.label,
    required this.code,
    required this.current,
    required this.onTap,
    this.isDark = false,
  });

  @override
  Widget build(BuildContext context) {
    final isSelected = current.languageCode == code;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: GoogleFonts.montserrat(
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                fontSize: 15,
                color: isSelected ? const Color(0xFF00A8D8) : (isDark ? const Color(0xFFB0C4D0) : const Color(0xFF05222B)),
              ),
            ),
            if (isSelected)
              const Icon(Icons.check_circle_rounded, color: Color(0xFF00A8D8), size: 18),
          ],
        ),
      ),
    );
  }
}
