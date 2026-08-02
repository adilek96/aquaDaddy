import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:aqua_daddy_flutter/l10n/app_localizations.dart';
import 'package:aqua_daddy_flutter/core/api_error.dart';
import 'package:aqua_daddy_flutter/data/models/comment.dart';
import 'package:aqua_daddy_flutter/features/auth/auth_provider.dart';
import 'package:aqua_daddy_flutter/features/dashboard/aquarium_provider.dart';

import 'package:aqua_daddy_flutter/features/aquarium/inhabitants_provider.dart';
import 'package:aqua_daddy_flutter/features/aquarium/maintenance_provider.dart';
import 'package:aqua_daddy_flutter/features/aquarium/maintenance_sheet.dart';
import 'package:aqua_daddy_flutter/features/aquarium/reminder_provider.dart';
import 'package:aqua_daddy_flutter/features/aquarium/reminder_sheet.dart';
import 'package:aqua_daddy_flutter/features/community/interaction_provider.dart';
import 'package:aqua_daddy_flutter/features/community/rating_bar.dart';
import 'package:aqua_daddy_flutter/features/aquarium/images_provider.dart';

class AquariumDetailScreen extends ConsumerStatefulWidget {
  final String aquariumId;
  const AquariumDetailScreen({super.key, required this.aquariumId});

  @override
  ConsumerState<AquariumDetailScreen> createState() =>
      _AquariumDetailScreenState();
}

class _AquariumDetailScreenState extends ConsumerState<AquariumDetailScreen> {
  // Контроллер жил внутри build() и пересоздавался на каждой перерисовке,
  // из-за чего набранный комментарий пропадал
  final _commentController = TextEditingController();

  Comment? _replyTo;

  String get aquariumId => widget.aquariumId;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<bool> _confirm(String title, String message) async {
    final l10n = AppLocalizations.of(context)!;

    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(l10n.cancel),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(
              l10n.delete,
              style: const TextStyle(color: Colors.redAccent),
            ),
          ),
        ],
      ),
    );

    return result ?? false;
  }

  void _showAddPhoto() {
    final l10n = AppLocalizations.of(context)!;
    final urlController = TextEditingController();

    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(l10n.addPhotoUrl),
        content: TextField(
          controller: urlController,
          decoration: InputDecoration(hintText: l10n.enterImageUrl),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: Text(l10n.cancel),
          ),
          ElevatedButton(
            onPressed: () {
              final url = urlController.text.trim();
              Navigator.pop(dialogContext);
              if (url.isEmpty) return;
              runWithFeedback(
                context,
                () => ref
                    .read(aquariumImagesProvider(aquariumId).notifier)
                    .addImage(url),
              );
            },
            child: Text(l10n.add),
          ),
        ],
      ),
    );
  }

  void _submitComment() {
    final text = _commentController.text.trim();
    if (text.isEmpty) return;

    final parentId = _replyTo?.id;
    _commentController.clear();
    setState(() => _replyTo = null);

    runWithFeedback(
      context,
      () => ref
          .read(commentsProvider(aquariumId).notifier)
          .addComment(text, parentId: parentId),
    );
  }

  Future<void> _deleteComment(Comment comment) async {
    final l10n = AppLocalizations.of(context)!;
    if (!await _confirm(l10n.deleteTitle, l10n.deleteCommentMessage)) return;
    if (!mounted) return;

    await runWithFeedback(
      context,
      () => ref
          .read(commentsProvider(aquariumId).notifier)
          .deleteComment(comment.id),
      successMessage: l10n.deleted,
    );
  }

  void _showAddInhabitant() {
    final l10n = AppLocalizations.of(context)!;
    final speciesController = TextEditingController();
    final countController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (sheetContext) => Padding(
        padding: EdgeInsets.fromLTRB(
          24,
          24,
          24,
          MediaQuery.of(sheetContext).viewInsets.bottom + 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(l10n.addInhabitant, style: GoogleFonts.tektur(fontSize: 22)),
            const SizedBox(height: 24),
            TextField(
              controller: speciesController,
              decoration: InputDecoration(labelText: l10n.speciesName),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: countController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(labelText: l10n.countLabel),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  final species = speciesController.text.trim();
                  final count = int.tryParse(countController.text) ?? 1;
                  Navigator.pop(sheetContext);
                  if (species.isEmpty) return;
                  runWithFeedback(
                    context,
                    () => ref
                        .read(inhabitantsProvider(aquariumId).notifier)
                        .addInhabitant(species, count),
                  );
                },
                child: Text(l10n.add),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddMaintenance() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => MaintenanceSheet(aquariumId: aquariumId),
    );
  }

  void _showAddReminder() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => ReminderSheet(aquariumId: aquariumId),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final aquariumAsync = ref.watch(aquariumDetailProvider(aquariumId));
    final inhabitantsAsync = ref.watch(inhabitantsProvider(aquariumId));
    final maintenanceAsync = ref.watch(maintenanceProvider(aquariumId));
    final remindersAsync = ref.watch(remindersProvider(aquariumId));
    final commentsAsync = ref.watch(commentsProvider(aquariumId));
    final currentUserId = ref.watch(authProvider).user?['id'] as String?;

    return aquariumAsync.when(
      data: (aquarium) {
        // Журнал, обитатели и напоминания на сервере доступны только владельцу,
        // поэтому для чужого аквариума эти блоки не показываем
        final isOwner =
            currentUserId != null && aquarium.userId == currentUserId;

        return Scaffold(
          body: CustomScrollView(
            slivers: [
              SliverAppBar(
                expandedHeight: 250,
                pinned: true,
                flexibleSpace: FlexibleSpaceBar(
                  title: Text(
                    aquarium.name,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  background: Stack(
                    fit: StackFit.expand,
                    children: [
                      Container(color: Colors.blue.shade900),
                      if (aquarium.images.isNotEmpty)
                        Image.network(
                          aquarium.images.first.url,
                          fit: BoxFit.cover,
                        )
                      else
                        const Center(
                          child: Icon(
                            Icons.waves,
                            size: 80,
                            color: Colors.white24,
                          ),
                        ),
                      Container(
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            colors: [Colors.black54, Colors.transparent],
                            begin: Alignment.bottomCenter,
                            end: Alignment.topCenter,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                actions: [
                  if (isOwner)
                    IconButton(
                      icon: const Icon(Icons.history_edu),
                      onPressed: () =>
                          context.push('/aquarium/${aquarium.id}/log'),
                      tooltip: l10n.logParameters,
                    ),
                ],
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            l10n.currentStatus,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                            ),
                          ),
                          if (isOwner)
                            Row(
                              children: [
                                TextButton.icon(
                                  icon: const Icon(Icons.show_chart, size: 18),
                                  label: Text(l10n.history),
                                  onPressed: () => context.push(
                                    '/aquarium/${aquarium.id}/chart',
                                  ),
                                ),
                                TextButton.icon(
                                  icon: const Icon(Icons.add, size: 18),
                                  label: Text(l10n.logNow),
                                  onPressed: () => context.push(
                                    '/aquarium/${aquarium.id}/log',
                                  ),
                                ),
                              ],
                            ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Column(
                        children: [
                          Row(
                            children: [
                              StatChip(
                                label: "pH",
                                value:
                                    aquarium.waterParams?.ph?.toStringAsFixed(
                                      1,
                                    ) ??
                                    '--',
                                icon: Icons.science_outlined,
                                color: Colors.green,
                              ),
                              const SizedBox(width: 12),
                              StatChip(
                                label: "Temp",
                                value:
                                    "${aquarium.waterParams?.temperatureC?.toStringAsFixed(1) ?? '--'}°C",
                                icon: Icons.thermostat,
                                color:
                                    (aquarium.waterParams?.temperatureC !=
                                            null &&
                                        (aquarium.waterParams!.temperatureC! <
                                                22 ||
                                            aquarium
                                                    .waterParams!
                                                    .temperatureC! >
                                                28))
                                    ? Colors.redAccent
                                    : Colors.orange,
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              StatChip(
                                label: "NO2",
                                value:
                                    "${aquarium.waterParams?.no2?.toStringAsFixed(2) ?? '--'} mg/L",
                                icon: Icons.opacity,
                                color: Colors.redAccent,
                              ),
                              const SizedBox(width: 12),
                              StatChip(
                                label: "NO3",
                                value:
                                    "${aquarium.waterParams?.no3?.toStringAsFixed(1) ?? '--'} mg/L",
                                icon: Icons.bubble_chart,
                                color: Colors.purpleAccent,
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 32),
                      AquariumRatingBar(aquariumId: aquariumId),
                      if (isOwner) ...[
                        const SizedBox(height: 32),
                        SectionHeader(
                          title: l10n.inhabitants,
                          actionLabel: l10n.addSpecies,
                          onAction: _showAddInhabitant,
                        ),
                        const SizedBox(height: 12),
                        inhabitantsAsync.when(
                          data: (items) => Column(
                            children: items
                                .map(
                                  (i) => InhabitantTile(
                                    species: i.species,
                                    count: i.count,
                                    onDelete: () async {
                                      if (!await _confirm(
                                        l10n.deleteTitle,
                                        l10n.deleteInhabitantMessage(i.species),
                                      )) {
                                        return;
                                      }
                                      if (!context.mounted) return;
                                      await runWithFeedback(
                                        context,
                                        () => ref
                                            .read(
                                              inhabitantsProvider(
                                                aquariumId,
                                              ).notifier,
                                            )
                                            .deleteInhabitant(i.id),
                                        successMessage: l10n.deleted,
                                      );
                                    },
                                  ),
                                )
                                .toList(),
                          ),
                          loading: () =>
                              const Center(child: CircularProgressIndicator()),
                          error: (err, _) => Text(l10n.errorLoading),
                        ),
                        const SizedBox(height: 32),
                        SectionHeader(
                          title: l10n.maintenanceSection,
                          actionLabel: l10n.logTask,
                          onAction: _showAddMaintenance,
                        ),
                        const SizedBox(height: 12),
                        maintenanceAsync.when(
                          data: (items) => Column(
                            children: items
                                .map(
                                  (m) => MaintenanceCard(
                                    task: m.description,
                                    date: m.performedAt
                                        .toLocal()
                                        .toString()
                                        .split('.')[0],
                                    status: m.status,
                                    types: m.type,
                                    onDelete: () async {
                                      if (!await _confirm(
                                        l10n.deleteTitle,
                                        l10n.deleteMaintenanceMessage,
                                      )) {
                                        return;
                                      }
                                      if (!context.mounted) return;
                                      await runWithFeedback(
                                        context,
                                        () => ref
                                            .read(
                                              maintenanceProvider(
                                                aquariumId,
                                              ).notifier,
                                            )
                                            .deleteMaintenance(m.id),
                                        successMessage: l10n.deleted,
                                      );
                                    },
                                  ),
                                )
                                .toList(),
                          ),
                          loading: () =>
                              const Center(child: CircularProgressIndicator()),
                          error: (err, _) => Text(l10n.errorLoading),
                        ),
                        const SizedBox(height: 32),
                        SectionHeader(
                          title: l10n.remindersSection,
                          actionLabel: l10n.addReminder,
                          onAction: _showAddReminder,
                        ),
                        const SizedBox(height: 12),
                        remindersAsync.when(
                          data: (items) => Column(
                            children: items
                                .map(
                                  (r) => ListTile(
                                    contentPadding: EdgeInsets.zero,
                                    leading: Icon(
                                      Icons.alarm_rounded,
                                      color: r.isCompleted
                                          ? Colors.grey
                                          : const Color(0xFF00A8D8),
                                    ),
                                    title: Text(
                                      r.title,
                                      style: TextStyle(
                                        decoration: r.isCompleted
                                            ? TextDecoration.lineThrough
                                            : null,
                                      ),
                                    ),
                                    subtitle: Text(
                                      r.remindAt.toLocal().toString().split(
                                        '.',
                                      )[0],
                                    ),
                                    trailing: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Checkbox(
                                          value: r.isCompleted,
                                          activeColor: const Color(0xFF00A8D8),
                                          onChanged: (val) {
                                            if (val == null) return;
                                            runWithFeedback(
                                              context,
                                              () => ref
                                                  .read(
                                                    remindersProvider(
                                                      aquariumId,
                                                    ).notifier,
                                                  )
                                                  .markComplete(r.id, val),
                                            );
                                          },
                                        ),
                                        IconButton(
                                          icon: const Icon(
                                            Icons.delete_outline,
                                            size: 20,
                                            color: Colors.white38,
                                          ),
                                          tooltip: l10n.delete,
                                          onPressed: () async {
                                            if (!await _confirm(
                                              l10n.deleteTitle,
                                              l10n.deleteReminderMessage,
                                            )) {
                                              return;
                                            }
                                            if (!context.mounted) return;
                                            await runWithFeedback(
                                              context,
                                              () => ref
                                                  .read(
                                                    remindersProvider(
                                                      aquariumId,
                                                    ).notifier,
                                                  )
                                                  .deleteReminder(r.id),
                                              successMessage: l10n.deleted,
                                            );
                                          },
                                        ),
                                      ],
                                    ),
                                  ),
                                )
                                .toList(),
                          ),
                          loading: () =>
                              const Center(child: CircularProgressIndicator()),
                          error: (err, _) => Text(l10n.errorLoading),
                        ),
                      ],
                      const SizedBox(height: 32),
                      SectionHeader(
                        title: l10n.photoGallery,
                        actionLabel: isOwner ? l10n.addPhoto : '',
                        onAction: isOwner ? _showAddPhoto : () {},
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        height: 120,
                        child: ListView(
                          scrollDirection: Axis.horizontal,
                          children: [
                            ...aquarium.images.map(
                              (img) => Padding(
                                padding: const EdgeInsets.only(right: 12),
                                child: Stack(
                                  children: [
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(12),
                                      child: Image.network(
                                        img.url,
                                        width: 120,
                                        height: 120,
                                        fit: BoxFit.cover,
                                      ),
                                    ),
                                    if (isOwner)
                                      Positioned(
                                        top: 0,
                                        right: 0,
                                        child: InkWell(
                                          onTap: () async {
                                            if (!await _confirm(
                                              l10n.deleteTitle,
                                              l10n.deletePhotoMessage,
                                            )) {
                                              return;
                                            }
                                            if (!context.mounted) return;
                                            await runWithFeedback(
                                              context,
                                              () => ref
                                                  .read(
                                                    aquariumImagesProvider(
                                                      aquariumId,
                                                    ).notifier,
                                                  )
                                                  .deleteImage(img.id),
                                              successMessage: l10n.deleted,
                                            );
                                          },
                                          child: Container(
                                            margin: const EdgeInsets.all(4),
                                            padding: const EdgeInsets.all(4),
                                            decoration: const BoxDecoration(
                                              color: Colors.black54,
                                              shape: BoxShape.circle,
                                            ),
                                            child: const Icon(
                                              Icons.close,
                                              size: 14,
                                              color: Colors.white,
                                            ),
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            ),
                            if (aquarium.images.isEmpty)
                              Center(
                                child: Text(
                                  l10n.noPhotos,
                                  style: const TextStyle(color: Colors.white24),
                                ),
                              ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 48),
                      Text(
                        l10n.communityComments,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      const SizedBox(height: 16),
                      if (_replyTo != null)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  l10n.replyTo(
                                    _replyTo!.user.name ?? l10n.anonymous,
                                  ),
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: Colors.white54,
                                  ),
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.close, size: 16),
                                onPressed: () =>
                                    setState(() => _replyTo = null),
                              ),
                            ],
                          ),
                        ),
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _commentController,
                              textInputAction: TextInputAction.send,
                              onSubmitted: (_) => _submitComment(),
                              decoration: InputDecoration(
                                hintText: l10n.addComment,
                                border: const OutlineInputBorder(),
                              ),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.send, color: Colors.blue),
                            onPressed: _submitComment,
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      commentsAsync.when(
                        data: (comments) => comments.isEmpty
                            ? Text(l10n.noComments)
                            : Column(
                                children: comments
                                    .map(
                                      (c) => CommentThread(
                                        comment: c,
                                        currentUserId: currentUserId,
                                        ownerId: aquarium.userId,
                                        onReply: (target) =>
                                            setState(() => _replyTo = target),
                                        onDelete: _deleteComment,
                                      ),
                                    )
                                    .toList(),
                              ),
                        loading: () =>
                            const Center(child: CircularProgressIndicator()),
                        error: (err, _) => Text(l10n.errorLoading),
                      ),
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
      loading: () =>
          const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (err, stack) =>
          Scaffold(body: Center(child: Text(apiErrorMessage(err)))),
    );
  }
}

/// Комментарий вместе с ответами на него.
class CommentThread extends StatelessWidget {
  final Comment comment;
  final String? currentUserId;
  final String ownerId;
  final void Function(Comment) onReply;
  final Future<void> Function(Comment) onDelete;
  final bool isReply;

  const CommentThread({
    super.key,
    required this.comment,
    required this.currentUserId,
    required this.ownerId,
    required this.onReply,
    required this.onDelete,
    this.isReply = false,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    // Удалять может автор комментария и владелец аквариума — так же, как на сервере
    final canDelete =
        currentUserId != null &&
        (comment.userId == currentUserId || ownerId == currentUserId);

    return Padding(
      padding: EdgeInsets.only(bottom: 16, left: isReply ? 32 : 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                radius: isReply ? 12 : 16,
                backgroundImage: comment.user.image != null
                    ? NetworkImage(comment.user.image!)
                    : null,
                child: comment.user.image == null
                    ? Icon(Icons.person, size: isReply ? 12 : 16)
                    : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      comment.user.name ?? l10n.anonymous,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                    Text(comment.text),
                    Row(
                      children: [
                        Text(
                          comment.createdAt.toLocal().toString().split(' ')[0],
                          style: const TextStyle(
                            fontSize: 10,
                            color: Colors.white54,
                          ),
                        ),
                        if (!isReply) ...[
                          const SizedBox(width: 12),
                          _TinyAction(
                            label: l10n.reply,
                            onTap: () => onReply(comment),
                          ),
                        ],
                        if (canDelete) ...[
                          const SizedBox(width: 12),
                          _TinyAction(
                            label: l10n.delete,
                            color: Colors.redAccent,
                            onTap: () => onDelete(comment),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          ...?comment.replies?.map(
            (reply) => Padding(
              padding: const EdgeInsets.only(top: 12),
              child: CommentThread(
                comment: reply,
                currentUserId: currentUserId,
                ownerId: ownerId,
                onReply: onReply,
                onDelete: onDelete,
                isReply: true,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _TinyAction extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  final Color? color;

  const _TinyAction({required this.label, required this.onTap, this.color});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Text(
        label,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.bold,
          color: color ?? Colors.white70,
        ),
      ),
    );
  }
}

class StatChip extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  const StatChip({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color),
            const SizedBox(height: 8),
            Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            Text(
              label,
              style: TextStyle(
                color: color.withValues(alpha: 0.7),
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class SectionHeader extends StatelessWidget {
  final String title;
  final String actionLabel;
  final VoidCallback onAction;
  const SectionHeader({
    super.key,
    required this.title,
    required this.actionLabel,
    required this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        TextButton(onPressed: onAction, child: Text(actionLabel)),
      ],
    );
  }
}

class InhabitantTile extends StatelessWidget {
  final String species;
  final int count;
  final VoidCallback? onDelete;
  const InhabitantTile({
    super.key,
    required this.species,
    required this.count,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: const CircleAvatar(
        backgroundColor: Colors.white10,
        child: Icon(Icons.pets, size: 20),
      ),
      title: Text(species),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            count > 0 ? "x$count" : "",
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
          if (onDelete != null)
            IconButton(
              icon: const Icon(
                Icons.delete_outline,
                size: 20,
                color: Colors.white38,
              ),
              tooltip: l10n.delete,
              onPressed: onDelete,
            ),
        ],
      ),
    );
  }
}

class MaintenanceCard extends StatelessWidget {
  final String task;
  final String date;
  final String status;
  final List<String> types;
  final VoidCallback? onDelete;

  const MaintenanceCard({
    super.key,
    required this.task,
    required this.date,
    required this.status,
    this.types = const [],
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    // API отдаёт COMPLETED в верхнем регистре — сравнение с "Completed"
    // не срабатывало никогда, и выполненные работы не подсвечивались
    final isDone = status == 'COMPLETED';

    final kindLabels = types
        .map((value) {
          final kind = MaintenanceKind.values
              .where((k) => k.apiValue == value)
              .firstOrNull;
          return kind == null ? value : maintenanceKindLabel(l10n, kind);
        })
        .join(', ');

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      color: Colors.white.withValues(alpha: 0.05),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        title: Text(task, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (kindLabels.isNotEmpty)
              Text(
                kindLabels,
                style: const TextStyle(fontSize: 12, color: Colors.white54),
              ),
            if (date.isNotEmpty) Text(date),
          ],
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (status.isNotEmpty)
              Text(
                maintenanceStatusLabel(l10n, status),
                style: TextStyle(
                  fontSize: 12,
                  color: isDone ? Colors.green : Colors.orangeAccent,
                ),
              ),
            if (onDelete != null)
              IconButton(
                icon: const Icon(
                  Icons.delete_outline,
                  size: 20,
                  color: Colors.white38,
                ),
                tooltip: l10n.delete,
                onPressed: onDelete,
              ),
          ],
        ),
      ),
    );
  }
}
