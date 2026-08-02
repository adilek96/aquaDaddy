import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import 'package:aqua_daddy_flutter/l10n/app_localizations.dart';
import 'package:aqua_daddy_flutter/features/auth/auth_provider.dart';
import 'package:aqua_daddy_flutter/core/locale_provider.dart';
import 'package:aqua_daddy_flutter/core/app_header.dart';
import 'package:aqua_daddy_flutter/features/dashboard/aquarium_provider.dart';
import 'package:aqua_daddy_flutter/features/discovery/discovery_provider.dart';
import 'package:aqua_daddy_flutter/features/discovery/discovery_screen.dart';
import 'package:aqua_daddy_flutter/data/models/aquarium.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: const AppHeader(),
      body: IndexedStack(
        index: _currentIndex,
        children: const [
          _MyTanksTab(),
          _DiscoveryTab(),
          _ProfileTab(),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF0D2233) : const Color(0xFFEAF9FA),
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 12, offset: const Offset(0, -4)),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (i) => setState(() => _currentIndex = i),
          backgroundColor: Colors.transparent,
          elevation: 0,
          selectedItemColor: const Color(0xFF00A8D8),
          unselectedItemColor: const Color(0xFF6A8A90),
          selectedLabelStyle: GoogleFonts.montserrat(fontWeight: FontWeight.w700, fontSize: 11),
          unselectedLabelStyle: GoogleFonts.montserrat(fontSize: 11),
          items: [
            BottomNavigationBarItem(
              icon: const Icon(Icons.waves_outlined),
              activeIcon: const Icon(Icons.waves_rounded),
              label: l10n.myTanks,
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.public_outlined),
              activeIcon: const Icon(Icons.public_rounded),
              label: l10n.discovery,
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.person_outline_rounded),
              activeIcon: const Icon(Icons.person_rounded),
              label: l10n.profile,
            ),
          ],
        ),
      ),
      floatingActionButton: _currentIndex == 0
          ? FloatingActionButton(
              onPressed: () => context.push('/add'),
              backgroundColor: const Color(0xFF00A8D8),
              foregroundColor: Colors.white,
              elevation: 2,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: const Icon(Icons.add_rounded),
            )
          : null,
    );
  }
}

// ─────────────────────────────────────────────
// Tab 0: My Tanks
// ─────────────────────────────────────────────
class _MyTanksTab extends ConsumerWidget {
  const _MyTanksTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final aquariumsAsync = ref.watch(aquariumsProvider);

    return SafeArea(
      child: Column(
        children: [
          const SizedBox(height: 8),

          // Aquariums list
          Expanded(
            child: RefreshIndicator(
              color: const Color(0xFF00A8D8),
              onRefresh: () => ref.read(aquariumsProvider.notifier).refresh(),
              child: aquariumsAsync.when(
                data: (aquariums) {
                  if (aquariums.isEmpty) {
                    return ListView(
                      padding: const EdgeInsets.all(24),
                      children: [
                        const SizedBox(height: 60),
                        Icon(Icons.waves_rounded, size: 72, color: const Color(0xFF00A8D8).withValues(alpha: 0.2)),
                        const SizedBox(height: 16),
                        Text(
                          l10n.noAquariums,
                          textAlign: TextAlign.center,
                          style: GoogleFonts.montserrat(color: const Color(0xFF6A8A90), fontSize: 15),
                        ),
                      ],
                    );
                  }
                  return ListView.builder(
                    padding: const EdgeInsets.fromLTRB(20, 8, 20, 90),
                    itemCount: aquariums.length,
                    itemBuilder: (context, index) => _TankCard(aquarium: aquariums[index]),
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFF00A8D8))),
                error: (err, _) => Center(
                  child: Text(l10n.errorLoading, style: GoogleFonts.montserrat(color: const Color(0xFF6A8A90))),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _TankCard extends StatelessWidget {
  final Aquarium aquarium;
  const _TankCard({required this.aquarium});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return GestureDetector(
      onTap: () => context.push('/aquarium/${aquarium.id}'),
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF0F2030) : const Color(0xFFEAF9FA),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 12, offset: const Offset(0, 5)),
          ],
        ),
        child: Row(
          children: [
            // Image or placeholder
            ClipRRect(
              borderRadius: const BorderRadius.horizontal(left: Radius.circular(16)),
              child: SizedBox(
                width: 96,
                height: 96,
                child: aquarium.images.isNotEmpty
                    ? Image.network(
                        aquarium.images.first.url,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => _PlaceholderBox(),
                      )
                    : _PlaceholderBox(),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 4),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      aquarium.name,
                      style: GoogleFonts.tektur(fontSize: 20, color: isDark ? const Color(0xFFE2E8F0) : const Color(0xFF05222B)),
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${_typeShort(aquarium.type)}  •  ${aquarium.volumeLiters?.toStringAsFixed(0) ?? '?'}L',
                      style: GoogleFonts.montserrat(fontSize: 12, color: const Color(0xFF6A8A90)),
                    ),
                    if (aquarium.isPublic) ...[
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFF00A8D8).withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          'Public',
                          style: GoogleFonts.montserrat(fontSize: 10, fontWeight: FontWeight.w600, color: const Color(0xFF00A8D8)),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const Padding(
              padding: EdgeInsets.only(right: 12),
              child: Icon(Icons.chevron_right_rounded, color: Color(0xFF6A8A90)),
            ),
          ],
        ),
      ),
    );
  }

  String _typeShort(String type) {
    switch (type.toUpperCase()) {
      case 'FRESHWATER': return 'FW';
      case 'SALTWATER': return 'SW';
      case 'PALUDARIUM': return 'PAL';
      default: return type;
    }
  }
}

class _PlaceholderBox extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF00A8D8).withValues(alpha: 0.08),
      child: Center(
        child: Icon(Icons.waves_rounded, size: 32, color: const Color(0xFF00A8D8).withValues(alpha: 0.3)),
      ),
    );
  }
}

// ─────────────────────────────────────────────
// Tab 1: Discovery
// ─────────────────────────────────────────────
class _DiscoveryTab extends ConsumerStatefulWidget {
  const _DiscoveryTab();

  @override
  ConsumerState<_DiscoveryTab> createState() => _DiscoveryTabState();
}

class _DiscoveryTabState extends ConsumerState<_DiscoveryTab> {
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _searchController = TextEditingController();
  Timer? _searchDebounce;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    // Незавершённый таймер поиска обращался бы к ref после dispose
    _searchDebounce?.cancel();
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    setState(() {});
    _searchDebounce?.cancel();
    _searchDebounce = Timer(const Duration(milliseconds: 400), () {
      if (!mounted) return;
      ref.read(discoveryProvider.notifier).search(query.trim());
    });
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 200) {
      ref.read(discoveryProvider.notifier).loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final discoveryAsync = ref.watch(discoveryProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SafeArea(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
            child: Text(
              l10n.discovery,
              style: GoogleFonts.tektur(fontSize: 28, color: isDark ? const Color(0xFFE2E8F0) : const Color(0xFF05222B)),
            ),
          ),
          const SizedBox(height: 12),

          // Search bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Container(
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF0F2030) : const Color(0xFFEAF9FA),
                borderRadius: BorderRadius.circular(12),
                boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 4))],
              ),
              child: TextField(
                controller: _searchController,
                onChanged: _onSearchChanged,
                style: GoogleFonts.montserrat(fontSize: 14, color: isDark ? const Color(0xFFE2E8F0) : const Color(0xFF05222B)),
                decoration: InputDecoration(
                  hintText: l10n.searchAquariums,
                  hintStyle: GoogleFonts.montserrat(color: const Color(0xFF6A8A90), fontSize: 14),
                  prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF00A8D8), size: 20),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? GestureDetector(
                          onTap: () {
                            _searchController.clear();
                            ref.read(discoveryProvider.notifier).search('');
                            setState(() {});
                          },
                          child: const Icon(Icons.close_rounded, color: Color(0xFF6A8A90), size: 18),
                        )
                      : null,
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(vertical: 14),
                ),
              ),
            ),
          ),
          const SizedBox(height: 14),

          Expanded(
            child: RefreshIndicator(
              color: const Color(0xFF00A8D8),
              onRefresh: () => ref.read(discoveryProvider.notifier).refresh(),
              child: discoveryAsync.when(
                data: (items) {
                  if (items.isEmpty) {
                    return ListView(
                      children: [
                        const SizedBox(height: 80),
                        Icon(Icons.search_off_rounded, size: 64, color: const Color(0xFF00A8D8).withValues(alpha: 0.3)),
                        const SizedBox(height: 12),
                        Center(
                          child: Text(l10n.noResults, style: GoogleFonts.montserrat(color: const Color(0xFF6A8A90))),
                        ),
                      ],
                    );
                  }
                  return GridView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 90),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      mainAxisSpacing: 12,
                      crossAxisSpacing: 12,
                      childAspectRatio: 0.78,
                    ),
                    itemCount: items.length,
                    itemBuilder: (context, index) => DiscoveryCard(aquarium: items[index]),
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFF00A8D8))),
                error: (err, _) => Center(
                  child: Text(l10n.errorLoading, style: GoogleFonts.montserrat(color: const Color(0xFF6A8A90))),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────
// Tab 2: Profile (inline)
// ─────────────────────────────────────────────
class _ProfileTab extends ConsumerWidget {
  const _ProfileTab();

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

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 90),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(l10n.profile, style: GoogleFonts.tektur(fontSize: 28, color: titleColor)),
            const SizedBox(height: 20),

            // User card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 14, offset: const Offset(0, 6))],
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 32,
                    backgroundColor: const Color(0xFF00A8D8).withValues(alpha: 0.12),
                    backgroundImage: image != null ? NetworkImage(image) : null,
                    child: image == null
                        ? Text(
                            name.isNotEmpty ? name[0].toUpperCase() : 'A',
                            style: GoogleFonts.tektur(fontSize: 28, color: const Color(0xFF00A8D8)),
                          )
                        : null,
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(name, style: GoogleFonts.tektur(fontSize: 22, color: titleColor), overflow: TextOverflow.ellipsis),
                        if (email.isNotEmpty)
                          Text(email, style: GoogleFonts.montserrat(fontSize: 12, color: const Color(0xFF6A8A90)), overflow: TextOverflow.ellipsis),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Aquarium count
            aquariumsAsync.maybeWhen(
              data: (aquariums) => Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 4))],
                ),
                child: Row(
                  children: [
                    Container(
                      width: 44, height: 44,
                      decoration: BoxDecoration(
                        color: const Color(0xFF00A8D8).withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.waves_rounded, color: Color(0xFF00A8D8), size: 22),
                    ),
                    const SizedBox(width: 14),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('${aquariums.length}', style: GoogleFonts.tektur(fontSize: 26, color: titleColor)),
                        Text(l10n.myTanks, style: GoogleFonts.montserrat(fontSize: 12, color: const Color(0xFF6A8A90))),
                      ],
                    ),
                  ],
                ),
              ),
              orElse: () => const SizedBox.shrink(),
            ),
            const SizedBox(height: 24),

            // Language section
            Padding(
              padding: const EdgeInsets.only(left: 4, bottom: 8),
              child: Text(
                l10n.language.toUpperCase(),
                style: GoogleFonts.montserrat(fontSize: 11, fontWeight: FontWeight.w700, color: const Color(0xFF6A8A90), letterSpacing: 1.2),
              ),
            ),
            Container(
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(14),
                boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 4))],
              ),
              child: Column(
                children: [
                  _LangTile(label: 'English', code: 'en', current: currentLocale, ref: ref, isDark: isDark),
                  Divider(height: 1, indent: 16, endIndent: 16, color: dividerColor),
                  _LangTile(label: 'Русский', code: 'ru', current: currentLocale, ref: ref, isDark: isDark),
                  Divider(height: 1, indent: 16, endIndent: 16, color: dividerColor),
                  _LangTile(label: 'Azərbaycan', code: 'az', current: currentLocale, ref: ref, isDark: isDark),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Logout
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
                    Text(l10n.logout, style: GoogleFonts.montserrat(fontWeight: FontWeight.w600, fontSize: 15, color: const Color(0xFFE53935))),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _LangTile extends StatelessWidget {
  final String label;
  final String code;
  final Locale current;
  final WidgetRef ref;
  final bool isDark;
  const _LangTile({required this.label, required this.code, required this.current, required this.ref, this.isDark = false});

  @override
  Widget build(BuildContext context) {
    final isSelected = current.languageCode == code;
    return InkWell(
      onTap: () => ref.read(localeProvider.notifier).state = Locale(code),
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
            if (isSelected) const Icon(Icons.check_circle_rounded, color: Color(0xFF00A8D8), size: 18),
          ],
        ),
      ),
    );
  }
}
