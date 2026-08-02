import 'dart:math' as math;

/// Формы аквариума. Значения должны совпадать со строками, которые пишет
/// веб-версия (components/component/aquariumAddingForm.tsx), иначе один и тот же
/// аквариум будет отображаться по-разному в вебе и в приложении.
enum AquariumShape {
  rectangular('rectangular'),
  cube('cube'),
  bow('bow'),
  hexagon('hexagon'),
  cylinder('cylinder'),
  sphere('sphere'),
  hemisphere('hemisphere');

  const AquariumShape(this.apiValue);
  final String apiValue;
}

/// Тип аквариума — значения enum AquariumType в схеме Prisma.
enum AquariumKind {
  freshwater('FRESHWATER'),
  saltwater('SALTWATER'),
  paludarium('PALUDARIUM');

  const AquariumKind(this.apiValue);
  final String apiValue;
}

/// Какие размеры нужны для конкретной формы.
enum Dimension { length, width, height, depth, diameter, side, k }

List<Dimension> dimensionsFor(AquariumShape shape) {
  switch (shape) {
    case AquariumShape.rectangular:
      return [Dimension.length, Dimension.width, Dimension.height];
    case AquariumShape.cube:
      return [Dimension.length, Dimension.height];
    case AquariumShape.bow:
      return [Dimension.width, Dimension.height, Dimension.depth, Dimension.k];
    case AquariumShape.hexagon:
      return [Dimension.side, Dimension.height];
    case AquariumShape.cylinder:
      return [Dimension.diameter, Dimension.height];
    case AquariumShape.sphere:
    case AquariumShape.hemisphere:
      return [Dimension.diameter];
  }
}

/// Объём в литрах по размерам в сантиметрах.
/// Формулы повторяют calculateVolume() из веб-версии.
double calculateVolumeLiters(
  AquariumShape shape,
  Map<Dimension, double?> values,
) {
  double v(Dimension d) => values[d] ?? 0;

  switch (shape) {
    case AquariumShape.rectangular:
      return v(Dimension.length) *
          v(Dimension.width) *
          v(Dimension.height) /
          1000;
    case AquariumShape.cube:
      final l = v(Dimension.length);
      return l * l * v(Dimension.height) / 1000;
    case AquariumShape.bow:
      final k = values[Dimension.k] ?? 0.9;
      return v(Dimension.width) *
          v(Dimension.height) *
          v(Dimension.depth) *
          k /
          1000;
    case AquariumShape.hexagon:
      final a = v(Dimension.side);
      final s = (3 * math.sqrt(3) / 2) * a * a;
      return s * v(Dimension.height) / 1000;
    case AquariumShape.cylinder:
      final r = v(Dimension.diameter) / 2;
      return math.pi * r * r * v(Dimension.height) / 1000;
    case AquariumShape.sphere:
      final r = v(Dimension.diameter) / 2;
      return (4 / 3) * math.pi * math.pow(r, 3) / 1000;
    case AquariumShape.hemisphere:
      final r = v(Dimension.diameter) / 2;
      return (2 / 3) * math.pi * math.pow(r, 3) / 1000;
  }
}

/// Имена полей, которые ждёт API (см. pickAquariumInput на бэкенде).
const dimensionApiField = <Dimension, String>{
  Dimension.length: 'lengthCm',
  Dimension.width: 'widthCm',
  Dimension.height: 'heightCm',
  Dimension.depth: 'depthCm',
  Dimension.diameter: 'diameterCm',
  Dimension.side: 'sideCm',
  Dimension.k: 'k',
};
