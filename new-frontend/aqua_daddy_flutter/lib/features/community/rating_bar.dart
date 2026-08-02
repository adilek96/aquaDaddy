import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:aqua_daddy_flutter/core/api_error.dart';
import 'package:aqua_daddy_flutter/l10n/app_localizations.dart';
import 'package:aqua_daddy_flutter/features/community/interaction_provider.dart';

/// Оценка аквариума звёздами. Провайдер рейтинга существовал в проекте,
/// но ни один экран его не использовал.
class AquariumRatingBar extends ConsumerWidget {
  final String aquariumId;
  const AquariumRatingBar({super.key, required this.aquariumId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final ratingAsync = ref.watch(aquariumRatingProvider(aquariumId));

    return ratingAsync.when(
      loading: () => const SizedBox(
        height: 48,
        child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
      ),
      error: (_, __) => Text(l10n.errorLoading),
      data: (rating) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            rating.count > 0
                ? l10n.ratingSummary(
                    rating.average.toStringAsFixed(1),
                    rating.count,
                  )
                : l10n.noRatings,
            style: const TextStyle(fontSize: 12, color: Colors.white54),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Text(
                l10n.rateThisTank,
                style: const TextStyle(fontSize: 12, color: Colors.white54),
              ),
              const SizedBox(width: 8),
              ...List.generate(5, (index) {
                final value = index + 1;
                final selected = (rating.userRating ?? 0) >= value;

                return IconButton(
                  visualDensity: VisualDensity.compact,
                  constraints: const BoxConstraints(),
                  padding: const EdgeInsets.symmetric(horizontal: 2),
                  icon: Icon(
                    selected ? Icons.star_rounded : Icons.star_border_rounded,
                    color: selected ? Colors.amber : Colors.white38,
                    size: 26,
                  ),
                  onPressed: () => runWithFeedback(
                    context,
                    () => ref
                        .read(aquariumRatingProvider(aquariumId).notifier)
                        .rate(value),
                    successMessage: l10n.ratingSaved,
                  ),
                );
              }),
            ],
          ),
        ],
      ),
    );
  }
}
