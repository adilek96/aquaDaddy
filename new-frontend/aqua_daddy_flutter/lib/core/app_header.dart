import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import 'package:aqua_daddy_flutter/features/auth/auth_provider.dart';
import 'package:aqua_daddy_flutter/core/locale_provider.dart';
import 'package:aqua_daddy_flutter/core/settings_sheet.dart';
import 'package:aqua_daddy_flutter/l10n/app_localizations.dart';

/// Shared app header matching the web's fixed header:
/// Left: back/home button + globe language dropdown
/// Right: user avatar dropdown (auth-aware)
class AppHeader extends ConsumerWidget implements PreferredSizeWidget {
  const AppHeader({super.key});

  @override
  Size get preferredSize => const Size.fromHeight(72);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return ClipRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 14, sigmaY: 14),
        child: Container(
          height: preferredSize.height,
          padding: const EdgeInsets.symmetric(horizontal: 8),
          decoration: BoxDecoration(
            // web: bg-[#00EBFF]/5
            color: const Color(0x0D00EBFF),
            border: Border(
              bottom: BorderSide(
                color: isDark
                    ? const Color(0xFF1E3A50)
                    : const Color(0xFFE2E8F0),
              ),
            ),
          ),
          child: const Row(
            children: [
              _HomeBackButton(),
              _LanguageButton(),
              Spacer(),
              _LogoWidget(),
              Spacer(),
              _UserMenuButton(),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Center logo ─────────────────────────────────────────────────────────────

class _LogoWidget extends StatelessWidget {
  const _LogoWidget();

  @override
  Widget build(BuildContext context) {
    return SvgPicture.asset(
      'assets/app-logo.svg',
      height: 70,
      fit: BoxFit.contain,
      placeholderBuilder: (_) => const SizedBox(width: 180, height: 70),
    );
  }
}

// ── Home button ─────────────────────────────────────────────────────────────

class _HomeBackButton extends StatelessWidget {
  const _HomeBackButton();

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();
    if (location == '/') return const SizedBox.shrink();
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return IconButton(
      tooltip: 'Home',
      iconSize: 20,
      onPressed: () => context.go('/'),
      icon: Icon(
        Icons.home_outlined,
        color: isDark ? const Color(0xFFB0C4D0) : const Color(0xFF05222B),
      ),
    );
  }
}

// ── Language dropdown (globe icon) ─────────────────────────────────────────

class _LanguageButton extends ConsumerWidget {
  const _LanguageButton();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final current = ref.watch(localeProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final menuBg = isDark ? const Color(0xFF0F2030) : Colors.white;
    final borderColor = isDark
        ? const Color(0xFF1E3A50)
        : const Color(0xFFE2E8F0);

    return PopupMenuButton<String>(
      tooltip: 'Language',
      offset: const Offset(0, 50),
      color: menuBg,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: borderColor),
      ),
      elevation: 8,
      icon: const Icon(
        Icons.language_rounded,
        color: Color(0xFF6A8A90),
        size: 22,
      ),
      onSelected: (code) {
        ref.read(localeProvider.notifier).state = Locale(code);
      },
      itemBuilder: (_) => [
        _langItem('en', 'English', current.languageCode, isDark),
        _langItem('ru', 'Русский', current.languageCode, isDark),
        _langItem('az', 'Azərbaycan', current.languageCode, isDark),
      ],
    );
  }

  PopupMenuItem<String> _langItem(
    String code,
    String label,
    String current,
    bool isDark,
  ) {
    final selected = current == code;
    return PopupMenuItem<String>(
      value: code,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.montserrat(
              fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
              fontSize: 14,
              color: selected
                  ? const Color(0xFF00A8D8)
                  : (isDark
                        ? const Color(0xFFB0C4D0)
                        : const Color(0xFF05222B)),
            ),
          ),
          if (selected)
            const Icon(Icons.check_rounded, color: Color(0xFF00A8D8), size: 16),
        ],
      ),
    );
  }
}

// ── User menu dropdown (avatar) ─────────────────────────────────────────────

class _UserMenuButton extends ConsumerWidget {
  const _UserMenuButton();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final l10n = AppLocalizations.of(context)!;
    final user = authState.user;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final menuBg = isDark ? const Color(0xFF0F2030) : Colors.white;
    final borderColor = isDark
        ? const Color(0xFF1E3A50)
        : const Color(0xFFE2E8F0);
    final itemColor = isDark
        ? const Color(0xFFB0C4D0)
        : const Color(0xFF05222B);
    final menuShape = RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(12),
      side: BorderSide(color: borderColor),
    );

    // ── Not logged in ────────────────────────────────────────────────────────
    if (user == null) {
      return PopupMenuButton<String>(
        tooltip: 'User menu',
        offset: const Offset(0, 50),
        color: menuBg,
        shape: menuShape,
        elevation: 8,
        child: const Padding(
          padding: EdgeInsets.symmetric(horizontal: 8),
          child: CircleAvatar(
            radius: 18,
            backgroundColor: Color(0x1400EBFF),
            child: Icon(
              Icons.person_outline_rounded,
              color: Color(0xFF6A8A90),
              size: 20,
            ),
          ),
        ),
        onSelected: (value) {
          if (value == 'signin') context.go('/login');
          if (value == 'settings') showSettingsSheet(context);
        },
        itemBuilder: (_) => [
          PopupMenuItem<String>(
            value: 'settings',
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Icon(Icons.settings_outlined, size: 18, color: itemColor),
                const SizedBox(width: 10),
                Text(
                  l10n.settings,
                  style: GoogleFonts.montserrat(
                    color: itemColor,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          PopupMenuItem<String>(
            value: 'signin',
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Icon(Icons.login_rounded, size: 18, color: itemColor),
                const SizedBox(width: 10),
                Text(
                  l10n.signInButton,
                  style: GoogleFonts.montserrat(
                    color: itemColor,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      );
    }

    // ── Logged in ────────────────────────────────────────────────────────────
    final name = user['name'] as String? ?? '';
    final email = user['email'] as String? ?? '';
    final image = user['image'] as String?;

    return PopupMenuButton<String>(
      tooltip: 'User menu',
      offset: const Offset(0, 50),
      color: menuBg,
      shape: menuShape,
      elevation: 8,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8),
        child: CircleAvatar(
          radius: 18,
          backgroundColor: const Color(0xFF00A8D8).withValues(alpha: 0.15),
          backgroundImage: image != null ? NetworkImage(image) : null,
          child: image == null
              ? Text(
                  name.isNotEmpty ? name[0].toUpperCase() : 'A',
                  style: GoogleFonts.tektur(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF00A8D8),
                  ),
                )
              : null,
        ),
      ),
      onSelected: (value) async {
        if (value == 'profile') {
          context.go('/profile');
        } else if (value == 'settings') {
          showSettingsSheet(context);
        } else if (value == 'logout') {
          await ref.read(authProvider.notifier).logout();
          if (context.mounted) context.go('/');
        }
      },
      itemBuilder: (_) => [
        // User info card (non-interactive)
        PopupMenuItem<String>(
          enabled: false,
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
          child: Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundColor: const Color(0xFF00A8D8).withValues(alpha: 0.15),
                backgroundImage: image != null ? NetworkImage(image) : null,
                child: image == null
                    ? Text(
                        name.isNotEmpty ? name[0].toUpperCase() : 'A',
                        style: GoogleFonts.tektur(
                          fontSize: 16,
                          color: const Color(0xFF00A8D8),
                        ),
                      )
                    : null,
              ),
              const SizedBox(width: 10),
              Flexible(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      name,
                      style: GoogleFonts.montserrat(
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                        color: itemColor,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (email.isNotEmpty)
                      Text(
                        email,
                        style: GoogleFonts.montserrat(
                          fontSize: 11,
                          color: const Color(0xFF6A8A90),
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const PopupMenuDivider(height: 1),
        // Profile
        PopupMenuItem<String>(
          value: 'profile',
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              Icon(Icons.person_outline_rounded, size: 18, color: itemColor),
              const SizedBox(width: 10),
              Text(
                l10n.profile,
                style: GoogleFonts.montserrat(
                  color: itemColor,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
        // Settings
        PopupMenuItem<String>(
          value: 'settings',
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              Icon(Icons.settings_outlined, size: 18, color: itemColor),
              const SizedBox(width: 10),
              Text(
                l10n.settings,
                style: GoogleFonts.montserrat(
                  color: itemColor,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
        // Logout
        PopupMenuItem<String>(
          value: 'logout',
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              const Icon(
                Icons.logout_rounded,
                size: 18,
                color: Color(0xFFE53935),
              ),
              const SizedBox(width: 10),
              Text(
                l10n.logout,
                style: GoogleFonts.montserrat(
                  color: const Color(0xFFE53935),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
