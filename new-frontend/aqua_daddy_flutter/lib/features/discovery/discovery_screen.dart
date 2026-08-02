import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import 'package:aqua_daddy_flutter/l10n/app_localizations.dart';
import 'package:aqua_daddy_flutter/core/app_header.dart';
import 'package:aqua_daddy_flutter/features/discovery/discovery_provider.dart';
import 'package:aqua_daddy_flutter/features/community/interaction_provider.dart';
import 'package:aqua_daddy_flutter/data/models/aquarium.dart';

class DiscoveryScreen extends ConsumerStatefulWidget {
  const DiscoveryScreen({super.key});

  @override
  ConsumerState<DiscoveryScreen> createState() => _DiscoveryScreenState();
}

class _DiscoveryScreenState extends ConsumerState<DiscoveryScreen> {
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      ref.read(discoveryProvider.notifier).loadMore();
    }
  }

  void _onSearchChanged(String query) {
    Future.delayed(const Duration(milliseconds: 400), () {
      if (_searchController.text == query) {
        ref.read(discoveryProvider.notifier).search(query.trim());
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final discoveryAsync = ref.watch(discoveryProvider);

    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: const AppHeader(),
      body: SafeArea(
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
            const SizedBox(height: 14),

                // Search bar
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Container(
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF0F2030) : const Color(0xFFEAF9FA),
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 4)),
                      ],
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
                const SizedBox(height: 16),

                // Grid
                Expanded(
                  child: RefreshIndicator(
                    color: const Color(0xFF00A8D8),
                    onRefresh: () => ref.read(discoveryProvider.notifier).refresh(),
                    child: discoveryAsync.when(
                      data: (items) {
                        if (items.isEmpty) {
                          return Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.search_off_rounded,
                                  size: 64,
                                  color: const Color(0xFF00A8D8).withValues(alpha: 0.3),
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  l10n.noResults,
                                  style: GoogleFonts.montserrat(color: const Color(0xFF6A8A90), fontSize: 15),
                                ),
                              ],
                            ),
                          );
                        }
                        return GridView.builder(
                          controller: _scrollController,
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
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
                      loading: () => const Center(
                        child: CircularProgressIndicator(color: Color(0xFF00A8D8)),
                      ),
                      error: (err, _) => Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Text(
                            '${AppLocalizations.of(context)!.errorLoading}\n$err',
                            textAlign: TextAlign.center,
                            style: GoogleFonts.montserrat(color: const Color(0xFF6A8A90)),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
  }
}

/// Reusable discovery card used in both DiscoveryScreen and DashboardScreen
class DiscoveryCard extends ConsumerWidget {
  final Aquarium aquarium;
  const DiscoveryCard({super.key, required this.aquarium});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final ratingAsync = ref.watch(aquariumRatingProvider(aquarium.id));
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: () => context.push('/aquarium/${aquarium.id}'),
      child: Container(
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF0F2030) : const Color(0xFFEAF9FA),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 10, offset: const Offset(0, 5)),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Image area
            Expanded(
              child: Stack(
                fit: StackFit.expand,
                children: [
                  Container(
                    color: const Color(0xFF00A8D8).withValues(alpha: 0.06),
                    child: aquarium.images.isNotEmpty
                        ? Image.network(
                            aquarium.images.first.url,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Center(
                              child: Icon(Icons.waves_rounded, size: 40, color: const Color(0xFF00A8D8).withValues(alpha: 0.25)),
                            ),
                          )
                        : Center(
                            child: Icon(Icons.waves_rounded, size: 40, color: const Color(0xFF00A8D8).withValues(alpha: 0.25)),
                          ),
                  ),
                  // Tank type badge
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF0F2030).withValues(alpha: 0.88) : Colors.white.withValues(alpha: 0.88),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        _typeLabel(aquarium.type, l10n),
                        style: GoogleFonts.montserrat(fontSize: 10, fontWeight: FontWeight.w600, color: isDark ? const Color(0xFFE2E8F0) : const Color(0xFF05222B)),
                      ),
                    ),
                  ),
                  // Rating badge
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.45),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.star_rounded, color: Colors.amber, size: 12),
                          const SizedBox(width: 3),
                          Text(
                            ratingAsync.maybeWhen(
                              data: (r) => r.average.toStringAsFixed(1),
                              orElse: () => '—',
                            ),
                            style: GoogleFonts.montserrat(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            // Info area
            Padding(
              padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    aquarium.name,
                    style: GoogleFonts.tektur(fontSize: 16, color: isDark ? const Color(0xFFE2E8F0) : const Color(0xFF05222B)),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    l10n.communityMember,
                    style: GoogleFonts.montserrat(fontSize: 11, color: const Color(0xFF6A8A90)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _typeLabel(String type, AppLocalizations l10n) {
    switch (type.toUpperCase()) {
      case 'FRESHWATER':
        return l10n.tankTypeFreshwater;
      case 'SALTWATER':
        return l10n.tankTypeSaltwater;
      case 'PALUDARIUM':
        return l10n.tankTypePaludarium;
      default:
        return type;
    }
  }
}
