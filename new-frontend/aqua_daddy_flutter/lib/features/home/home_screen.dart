import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import 'package:aqua_daddy_flutter/core/app_header.dart';
import 'package:aqua_daddy_flutter/l10n/app_localizations.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: const AppHeader(),
      body: SafeArea(
        top: false,
        child: LayoutBuilder(
          builder: (context, constraints) {
            final isWide = constraints.maxWidth >= 600;
            final hPad = isWide ? 32.0 : 16.0;
            return SingleChildScrollView(
              child: ConstrainedBox(
                constraints: BoxConstraints(minHeight: constraints.maxHeight),
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: hPad, vertical: 24),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      isWide ? _WideLayout(l10n: l10n) : _NarrowLayout(l10n: l10n),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

// ── Narrow (mobile) layout — cards stacked vertically ────────────────────────
class _NarrowLayout extends StatelessWidget {
  final AppLocalizations l10n;
  const _NarrowLayout({required this.l10n});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _HomeCard(
          title: l10n.myTanks,
          subtitle: l10n.myAquariumsSubtitle,
          action: l10n.viewAquariums,
          icon: Icons.waves_rounded,
          onAction: () => context.go('/login'),
        ),
        const SizedBox(height: 14),
        _HomeCard(
          title: l10n.wikiTitle,
          subtitle: l10n.wikiSubtitle,
          action: l10n.wikiLink,
          icon: Icons.menu_book_rounded,
          onAction: () => context.go('/discovery'),
        ),
        const SizedBox(height: 14),
        _HomeCard(
          title: l10n.discovery,
          subtitle: l10n.discoverySubtitle,
          action: l10n.startExploring,
          icon: Icons.public_rounded,
          onAction: () => context.go('/discovery'),
        ),
      ],
    );
  }
}

// ── Wide (tablet/desktop) layout — matching web grid ─────────────────────────
// Web: md:grid-cols-3
//   Row 1: Aquariums (col-span-3 = full width)
//   Row 2: Wiki (col-span-2) | Discovery (col-span-1)
class _WideLayout extends StatelessWidget {
  final AppLocalizations l10n;
  const _WideLayout({required this.l10n});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Row 1: Aquariums — full width
        _HomeCard(
          title: l10n.myTanks,
          subtitle: l10n.myAquariumsSubtitle,
          action: l10n.viewAquariums,
          icon: Icons.waves_rounded,
          onAction: () => context.go('/login'),
        ),
        const SizedBox(height: 16),
        // Row 2: Wiki (2/3) + Discovery (1/3)
        IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(
                flex: 2,
                child: _HomeCard(
                  title: l10n.wikiTitle,
                  subtitle: l10n.wikiSubtitle,
                  action: l10n.wikiLink,
                  icon: Icons.menu_book_rounded,
                  onAction: () => context.go('/discovery'),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                flex: 1,
                child: _HomeCard(
                  title: l10n.discovery,
                  subtitle: l10n.discoverySubtitle,
                  action: l10n.startExploring,
                  icon: Icons.public_rounded,
                  onAction: () => context.go('/discovery'),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ── Card widget ───────────────────────────────────────────────────────────────
class _HomeCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final String action;
  final IconData icon;
  final VoidCallback? onAction;

  const _HomeCard({
    required this.title,
    required this.subtitle,
    required this.action,
    required this.icon,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: const Color(0x0D00EBFF), // bg-[#00EBFF]/5 matching web
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? const Color(0xFF1E3A50) : const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: const Color(0xFF00A8D8).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: const Color(0xFF00A8D8), size: 28),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  title,
                  style: GoogleFonts.tektur(fontSize: 28, color: isDark ? const Color(0xFFE2E8F0) : const Color(0xFF05222B)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            subtitle,
            style: GoogleFonts.montserrat(fontSize: 15, color: const Color(0xFF6A8A90)),
          ),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: onAction,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  action,
                  style: GoogleFonts.montserrat(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF00A8D8),
                  ),
                ),
                const SizedBox(width: 4),
                const Icon(Icons.arrow_forward_rounded, size: 16, color: Color(0xFF00A8D8)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
