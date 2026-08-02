import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:aqua_daddy_flutter/core/api_error.dart';
import 'package:aqua_daddy_flutter/core/date_field.dart';
import 'package:aqua_daddy_flutter/l10n/app_localizations.dart';
import 'package:aqua_daddy_flutter/features/aquarium/maintenance_provider.dart';

String maintenanceKindLabel(AppLocalizations l10n, MaintenanceKind kind) {
  switch (kind) {
    case MaintenanceKind.waterChange:
      return l10n.mtWaterChange;
    case MaintenanceKind.gravelCleaning:
      return l10n.mtGravelCleaning;
    case MaintenanceKind.glassCleaning:
      return l10n.mtGlassCleaning;
    case MaintenanceKind.filterCleaning:
      return l10n.mtFilterCleaning;
    case MaintenanceKind.parameterCheck:
      return l10n.mtParameterCheck;
    case MaintenanceKind.plantCare:
      return l10n.mtPlantCare;
    case MaintenanceKind.coralCare:
      return l10n.mtCoralCare;
    case MaintenanceKind.supplements:
      return l10n.mtSupplements;
    case MaintenanceKind.algaeControl:
      return l10n.mtAlgaeControl;
    case MaintenanceKind.other:
      return l10n.mtOther;
  }
}

/// Подпись статуса из строки, которую вернул API.
String maintenanceStatusLabel(AppLocalizations l10n, String apiValue) {
  switch (apiValue) {
    case 'COMPLETED':
      return l10n.statusCompleted;
    case 'PENDING':
      return l10n.statusPending;
    case 'SKIPPED':
      return l10n.statusSkipped;
    case 'CANCELLED':
      return l10n.statusCancelled;
    default:
      return apiValue;
  }
}

/// Форма записи об обслуживании: описание, типы работ и дата.
/// Раньше отправлялось только описание, тип всегда OTHER, дата — «сейчас».
class MaintenanceSheet extends ConsumerStatefulWidget {
  final String aquariumId;
  const MaintenanceSheet({super.key, required this.aquariumId});

  @override
  ConsumerState<MaintenanceSheet> createState() => _MaintenanceSheetState();
}

class _MaintenanceSheetState extends ConsumerState<MaintenanceSheet> {
  final _descController = TextEditingController();
  final _selected = <MaintenanceKind>{MaintenanceKind.waterChange};
  DateTime _performedAt = DateTime.now();
  bool _saving = false;

  @override
  void dispose() {
    _descController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final l10n = AppLocalizations.of(context)!;
    final description = _descController.text.trim();

    if (description.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(l10n.requiredField)));
      return;
    }
    if (_selected.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(l10n.selectAtLeastOneType)));
      return;
    }

    setState(() => _saving = true);

    final ok = await runWithFeedback(
      context,
      () => ref
          .read(maintenanceProvider(widget.aquariumId).notifier)
          .addMaintenance(
            description,
            types: _selected.toList(),
            performedAt: _performedAt,
          ),
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
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              l10n.logMaintenance,
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: _descController,
              maxLines: 2,
              decoration: InputDecoration(
                hintText: l10n.maintenanceHint,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              l10n.maintenanceType,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: MaintenanceKind.values.map((kind) {
                final selected = _selected.contains(kind);
                return FilterChip(
                  label: Text(maintenanceKindLabel(l10n, kind)),
                  selected: selected,
                  onSelected: (value) => setState(() {
                    if (value) {
                      _selected.add(kind);
                    } else {
                      _selected.remove(kind);
                    }
                  }),
                );
              }).toList(),
            ),
            const SizedBox(height: 20),
            DateTimeField(
              label: l10n.pickDate,
              value: _performedAt,
              // Работу нельзя записать задним числом дальше, чем на год
              firstDate: DateTime.now().subtract(const Duration(days: 365)),
              lastDate: DateTime.now(),
              onChanged: (value) => setState(() => _performedAt = value),
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
      ),
    );
  }
}
