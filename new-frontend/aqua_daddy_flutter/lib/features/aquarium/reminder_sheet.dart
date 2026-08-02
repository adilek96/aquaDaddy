import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:aqua_daddy_flutter/core/api_error.dart';
import 'package:aqua_daddy_flutter/core/date_field.dart';
import 'package:aqua_daddy_flutter/l10n/app_localizations.dart';
import 'package:aqua_daddy_flutter/features/aquarium/reminder_provider.dart';

/// Напоминание с выбором даты. Раньше срок был жёстко «через 24 часа».
class ReminderSheet extends ConsumerStatefulWidget {
  final String aquariumId;
  const ReminderSheet({super.key, required this.aquariumId});

  @override
  ConsumerState<ReminderSheet> createState() => _ReminderSheetState();
}

class _ReminderSheetState extends ConsumerState<ReminderSheet> {
  final _titleController = TextEditingController();
  DateTime _remindAt = DateTime.now().add(const Duration(days: 1));
  bool _saving = false;

  @override
  void dispose() {
    _titleController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final l10n = AppLocalizations.of(context)!;
    final title = _titleController.text.trim();

    if (title.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(l10n.requiredField)));
      return;
    }

    setState(() => _saving = true);

    final ok = await runWithFeedback(
      context,
      () => ref
          .read(remindersProvider(widget.aquariumId).notifier)
          .addReminder(title, _remindAt),
    );

    if (!mounted) return;
    setState(() => _saving = false);
    if (ok) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Padding(
      padding: EdgeInsets.fromLTRB(
        24,
        24,
        24,
        MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.setReminder,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),
          TextField(
            controller: _titleController,
            decoration: InputDecoration(
              hintText: l10n.reminderHint,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          const SizedBox(height: 20),
          DateTimeField(
            label: l10n.reminderWhen,
            value: _remindAt,
            firstDate: DateTime.now(),
            lastDate: DateTime.now().add(const Duration(days: 365 * 2)),
            onChanged: (value) => setState(() => _remindAt = value),
          ),
          const SizedBox(height: 28),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _saving ? null : _submit,
              child: _saving
                  ? const SizedBox(
                      height: 18,
                      width: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Text(l10n.save),
            ),
          ),
        ],
      ),
    );
  }
}
