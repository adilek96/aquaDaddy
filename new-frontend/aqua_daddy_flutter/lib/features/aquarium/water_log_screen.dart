import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:aqua_daddy_flutter/core/api_error.dart';
import 'package:aqua_daddy_flutter/l10n/app_localizations.dart';
import 'package:aqua_daddy_flutter/features/aquarium/water_log_provider.dart';
import 'package:aqua_daddy_flutter/features/dashboard/aquarium_provider.dart';

/// Один замеряемый параметр: ключ в API и подпись в интерфейсе.
class _Param {
  final String apiKey;
  final String Function(AppLocalizations) label;
  final String? hint;

  const _Param(this.apiKey, this.label, {this.hint});
}

const _primaryParams = <_Param>[
  _Param('pH', _phLabel, hint: '7.0'),
  _Param('temperatureC', _tempLabel, hint: '25.5'),
  _Param('NO2', _no2Label, hint: 'mg/L'),
  _Param('NO3', _no3Label, hint: 'mg/L'),
  _Param('NH3', _nh3Label, hint: 'mg/L'),
];

const _extraParams = <_Param>[
  _Param('NH4', _nh4Label, hint: 'mg/L'),
  _Param('PO4', _po4Label, hint: 'mg/L'),
  _Param('GH', _ghLabel, hint: 'dGH'),
  _Param('KH', _khLabel, hint: 'dKH'),
  _Param('Ca', _caLabel, hint: 'mg/L'),
  _Param('Mg', _mgLabel, hint: 'mg/L'),
  _Param('K', _kLabel, hint: 'mg/L'),
  _Param('Fe', _feLabel, hint: 'mg/L'),
  _Param('salinity', _salinityLabel, hint: 'ppt'),
];

String _phLabel(AppLocalizations l) => 'pH';
String _tempLabel(AppLocalizations l) => l.paramTemperature;
String _no2Label(AppLocalizations l) => l.paramNitrite;
String _no3Label(AppLocalizations l) => l.paramNitrate;
String _nh3Label(AppLocalizations l) => l.paramAmmonia;
String _nh4Label(AppLocalizations l) => l.paramAmmonium;
String _po4Label(AppLocalizations l) => l.paramPhosphate;
String _ghLabel(AppLocalizations l) => l.paramGh;
String _khLabel(AppLocalizations l) => l.paramKh;
String _caLabel(AppLocalizations l) => l.paramCalcium;
String _mgLabel(AppLocalizations l) => l.paramMagnesium;
String _kLabel(AppLocalizations l) => l.paramPotassium;
String _feLabel(AppLocalizations l) => l.paramIron;
String _salinityLabel(AppLocalizations l) => l.paramSalinity;

class WaterLogScreen extends ConsumerStatefulWidget {
  final String aquariumId;
  const WaterLogScreen({super.key, required this.aquariumId});

  @override
  ConsumerState<WaterLogScreen> createState() => _WaterLogScreenState();
}

class _WaterLogScreenState extends ConsumerState<WaterLogScreen> {
  final _formKey = GlobalKey<FormState>();
  late final Map<String, TextEditingController> _controllers = {
    for (final p in [..._primaryParams, ..._extraParams])
      p.apiKey: TextEditingController(),
  };

  bool _isLoading = false;
  bool _showExtra = false;

  @override
  void dispose() {
    for (final controller in _controllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _submit() async {
    final l10n = AppLocalizations.of(context)!;
    if (!_formKey.currentState!.validate()) return;

    // Пустые поля не отправляем: null на сервере означает «стереть значение»,
    // и замер одного pH обнулял бы остальные параметры аквариума
    final measurements = <String, dynamic>{};
    _controllers.forEach((key, controller) {
      final raw = controller.text.trim().replaceAll(',', '.');
      if (raw.isEmpty) return;
      final parsed = double.tryParse(raw);
      if (parsed != null) measurements[key] = parsed;
    });

    if (measurements.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(l10n.fillAtLeastOne)));
      return;
    }

    setState(() => _isLoading = true);

    final ok = await runWithFeedback(
      context,
      () => ref.read(waterLogsProvider(widget.aquariumId).notifier).addLog({
        ...measurements,
        'recordedAt': DateTime.now().toIso8601String(),
      }),
      successMessage: l10n.logSaved,
    );

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (ok) {
      // Карточка аквариума показывает текущие параметры — их тоже обновляем
      ref.invalidate(aquariumDetailProvider(widget.aquariumId));
      ref.invalidate(aquariumsProvider);
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          l10n.logWaterTitle,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            ..._primaryParams.map(_buildField),
            const SizedBox(height: 8),
            TextButton.icon(
              onPressed: () => setState(() => _showExtra = !_showExtra),
              icon: Icon(_showExtra ? Icons.expand_less : Icons.expand_more),
              label: Text(l10n.moreParameters),
            ),
            if (_showExtra) ...[
              const SizedBox(height: 8),
              ..._extraParams.map(_buildField),
            ],
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _isLoading ? null : _submit,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: const Color(0xFF00B4D8),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: _isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : Text(l10n.saveLog.toUpperCase()),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildField(_Param param) {
    final l10n = AppLocalizations.of(context)!;

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: TextFormField(
        controller: _controllers[param.apiKey],
        keyboardType: const TextInputType.numberWithOptions(decimal: true),
        decoration: InputDecoration(
          labelText: param.label(l10n),
          hintText: param.hint,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        ),
        validator: (v) {
          final raw = v?.trim().replaceAll(',', '.') ?? '';
          if (raw.isEmpty) return null;
          final parsed = double.tryParse(raw);
          if (parsed == null || parsed < 0) return l10n.invalidNumber;
          return null;
        },
      ),
    );
  }
}
