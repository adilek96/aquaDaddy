import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:aqua_daddy_flutter/core/api_error.dart';
import 'package:aqua_daddy_flutter/core/aquarium_geometry.dart';
import 'package:aqua_daddy_flutter/l10n/app_localizations.dart';
import 'package:aqua_daddy_flutter/features/dashboard/aquarium_provider.dart';

class AddAquariumScreen extends ConsumerStatefulWidget {
  const AddAquariumScreen({super.key});

  @override
  ConsumerState<AddAquariumScreen> createState() => _AddAquariumScreenState();
}

class _AddAquariumScreenState extends ConsumerState<AddAquariumScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();

  final _dimensionControllers = <Dimension, TextEditingController>{
    for (final d in Dimension.values) d: TextEditingController(),
  };

  AquariumKind _kind = AquariumKind.freshwater;
  AquariumShape _shape = AquariumShape.rectangular;
  bool _isPublic = false;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    // Коэффициент выгиба по умолчанию — как в веб-версии
    _dimensionControllers[Dimension.k]!.text = '0.9';
    for (final controller in _dimensionControllers.values) {
      controller.addListener(_onDimensionChanged);
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    for (final controller in _dimensionControllers.values) {
      controller.removeListener(_onDimensionChanged);
      controller.dispose();
    }
    super.dispose();
  }

  void _onDimensionChanged() => setState(() {});

  Map<Dimension, double?> get _dimensionValues => {
    for (final d in dimensionsFor(_shape))
      d: double.tryParse(_dimensionControllers[d]!.text.replaceAll(',', '.')),
  };

  double get _volumeLiters => calculateVolumeLiters(_shape, _dimensionValues);

  String _shapeLabel(AppLocalizations l10n, AquariumShape shape) {
    switch (shape) {
      case AquariumShape.rectangular:
        return l10n.shapeRectangular;
      case AquariumShape.cube:
        return l10n.shapeCube;
      case AquariumShape.bow:
        return l10n.shapeBow;
      case AquariumShape.hexagon:
        return l10n.shapeHexagon;
      case AquariumShape.cylinder:
        return l10n.shapeCylinder;
      case AquariumShape.sphere:
        return l10n.shapeSphere;
      case AquariumShape.hemisphere:
        return l10n.shapeHemisphere;
    }
  }

  String _kindLabel(AppLocalizations l10n, AquariumKind kind) {
    switch (kind) {
      case AquariumKind.freshwater:
        return l10n.tankTypeFreshwater;
      case AquariumKind.saltwater:
        return l10n.tankTypeSaltwater;
      case AquariumKind.paludarium:
        return l10n.tankTypePaludarium;
    }
  }

  String _dimensionLabel(AppLocalizations l10n, Dimension dimension) {
    switch (dimension) {
      case Dimension.length:
        return l10n.lengthLabel;
      case Dimension.width:
        return l10n.widthLabel;
      case Dimension.height:
        return l10n.heightLabel;
      case Dimension.depth:
        return l10n.depthLabel;
      case Dimension.diameter:
        return l10n.diameterLabel;
      case Dimension.side:
        return l10n.sideLabel;
      case Dimension.k:
        return l10n.coefficientLabel;
    }
  }

  Future<void> _submit() async {
    final l10n = AppLocalizations.of(context)!;
    if (!_formKey.currentState!.validate()) return;

    setState(() => _saving = true);

    final payload = <String, dynamic>{
      'name': _nameController.text.trim(),
      // Раньше сюда уходило 'Freshwater'/'Brackish' — таких значений нет
      // в enum AquariumType, поэтому создание всегда падало
      'type': _kind.apiValue,
      'shape': _shape.apiValue,
      'isPublic': _isPublic,
      'volumeLiters': double.parse(_volumeLiters.toStringAsFixed(2)),
    };

    _dimensionValues.forEach((dimension, value) {
      if (value != null) {
        payload[dimensionApiField[dimension]!] = value;
      }
    });

    final ok = await runWithFeedback(
      context,
      () => ref.read(aquariumsProvider.notifier).addAquarium(payload),
      successMessage: l10n.tankCreated,
    );

    if (!mounted) return;
    setState(() => _saving = false);
    if (ok) context.pop();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final dimensions = dimensionsFor(_shape);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          l10n.addTank,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            TextFormField(
              controller: _nameController,
              decoration: InputDecoration(
                labelText: l10n.tankName,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? l10n.requiredField : null,
            ),
            const SizedBox(height: 20),
            DropdownButtonFormField<AquariumKind>(
              initialValue: _kind,
              decoration: InputDecoration(
                labelText: l10n.tankType,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              items: AquariumKind.values
                  .map(
                    (k) => DropdownMenuItem(
                      value: k,
                      child: Text(_kindLabel(l10n, k)),
                    ),
                  )
                  .toList(),
              onChanged: (v) => setState(() => _kind = v!),
            ),
            const SizedBox(height: 20),
            DropdownButtonFormField<AquariumShape>(
              initialValue: _shape,
              decoration: InputDecoration(
                labelText: l10n.tankShape,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              items: AquariumShape.values
                  .map(
                    (s) => DropdownMenuItem(
                      value: s,
                      child: Text(_shapeLabel(l10n, s)),
                    ),
                  )
                  .toList(),
              onChanged: (v) => setState(() => _shape = v!),
            ),
            const SizedBox(height: 20),
            ...dimensions.map(
              (dimension) => Padding(
                padding: const EdgeInsets.only(bottom: 20),
                child: TextFormField(
                  controller: _dimensionControllers[dimension],
                  keyboardType: const TextInputType.numberWithOptions(
                    decimal: true,
                  ),
                  decoration: InputDecoration(
                    labelText: _dimensionLabel(l10n, dimension),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) {
                      return l10n.requiredField;
                    }
                    final parsed = double.tryParse(v.replaceAll(',', '.'));
                    if (parsed == null || parsed <= 0) {
                      return l10n.invalidNumber;
                    }
                    return null;
                  },
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF00B4D8).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(l10n.calculatedVolume),
                  Text(
                    '${_volumeLiters.toStringAsFixed(1)} L',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                      color: Color(0xFF00B4D8),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            SwitchListTile(
              title: Text(l10n.publicTank),
              subtitle: Text(l10n.publicTankSubtitle),
              value: _isPublic,
              onChanged: (v) => setState(() => _isPublic = v),
              activeThumbColor: const Color(0xFF00B4D8),
            ),
            const SizedBox(height: 48),
            ElevatedButton(
              onPressed: _saving ? null : _submit,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: const Color(0xFF00B4D8),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: _saving
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : Text(l10n.createTank.toUpperCase()),
            ),
          ],
        ),
      ),
    );
  }
}
