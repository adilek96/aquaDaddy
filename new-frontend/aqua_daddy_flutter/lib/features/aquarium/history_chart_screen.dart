import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:aqua_daddy_flutter/core/api_error.dart';
import 'package:aqua_daddy_flutter/l10n/app_localizations.dart';
import 'package:aqua_daddy_flutter/data/models/water_log.dart';
import 'package:aqua_daddy_flutter/features/aquarium/water_log_provider.dart';

class _ChartParam {
  final String key;
  final String Function(AppLocalizations) label;
  final double? Function(WaterLog) read;

  const _ChartParam(this.key, this.label, this.read);
}

final _chartParams = <_ChartParam>[
  _ChartParam('pH', (l) => 'pH', (log) => log.ph),
  _ChartParam('temp', (l) => l.paramTemperature, (log) => log.temperatureC),
  _ChartParam('NO2', (l) => l.paramNitrite, (log) => log.no2),
  _ChartParam('NO3', (l) => l.paramNitrate, (log) => log.no3),
  _ChartParam('NH3', (l) => l.paramAmmonia, (log) => log.nh3),
  _ChartParam('NH4', (l) => l.paramAmmonium, (log) => log.nh4),
  _ChartParam('PO4', (l) => l.paramPhosphate, (log) => log.po4),
  _ChartParam('GH', (l) => l.paramGh, (log) => log.gh),
  _ChartParam('KH', (l) => l.paramKh, (log) => log.kh),
  _ChartParam('Ca', (l) => l.paramCalcium, (log) => log.ca),
  _ChartParam('Mg', (l) => l.paramMagnesium, (log) => log.mg),
  _ChartParam('K', (l) => l.paramPotassium, (log) => log.k),
  _ChartParam('salinity', (l) => l.paramSalinity, (log) => log.salinity),
];

class HistoryChartScreen extends ConsumerStatefulWidget {
  final String aquariumId;
  const HistoryChartScreen({super.key, required this.aquariumId});

  @override
  ConsumerState<HistoryChartScreen> createState() => _HistoryChartScreenState();
}

class _HistoryChartScreenState extends ConsumerState<HistoryChartScreen> {
  String _selectedKey = 'pH';

  _ChartParam get _param =>
      _chartParams.firstWhere((p) => p.key == _selectedKey);

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final logsAsync = ref.watch(waterLogsProvider(widget.aquariumId));

    return Scaffold(
      appBar: AppBar(
        title: Text(
          l10n.parameterHistory,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: [
          DropdownButton<String>(
            value: _selectedKey,
            dropdownColor: const Color(0xFF1B263B),
            underline: const SizedBox(),
            items: _chartParams
                .map(
                  (p) => DropdownMenuItem(
                    value: p.key,
                    child: Text(
                      p.label(l10n),
                      style: const TextStyle(color: Colors.white),
                    ),
                  ),
                )
                .toList(),
            onChanged: (val) => setState(() => _selectedKey = val!),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: logsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text(apiErrorMessage(err))),
        data: (logs) {
          // API отдаёт замеры от новых к старым — для графика нужен обратный
          // порядок, иначе время на оси идёт справа налево
          final ordered = [...logs]
            ..sort((a, b) => a.recordedAt.compareTo(b.recordedAt));

          // Непомеренные значения пропускаем: раньше они рисовались нулём
          // и график проваливался в ноль на каждом частичном замере
          final points = <MapEntry<DateTime, double>>[];
          for (final log in ordered) {
            final value = _param.read(log);
            if (value != null) {
              points.add(MapEntry(log.recordedAt.toLocal(), value));
            }
          }

          if (points.length < 2) {
            return Center(child: Text(l10n.noChartData));
          }

          final values = points.map((p) => p.value).toList();
          final minValue = values.reduce((a, b) => a < b ? a : b);
          final maxValue = values.reduce((a, b) => a > b ? a : b);
          // Небольшой запас сверху и снизу, чтобы линия не липла к рамке
          final padding = (maxValue - minValue).abs() < 0.001
              ? (maxValue.abs() * 0.1 + 1)
              : (maxValue - minValue) * 0.15;

          final spots = [
            for (var i = 0; i < points.length; i++)
              FlSpot(i.toDouble(), points[i].value),
          ];

          return Padding(
            padding: const EdgeInsets.fromLTRB(12, 24, 24, 24),
            child: LineChart(
              LineChartData(
                minY: minValue - padding,
                maxY: maxValue + padding,
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: true,
                  getDrawingHorizontalLine: (v) =>
                      const FlLine(color: Colors.white10, strokeWidth: 1),
                  getDrawingVerticalLine: (v) =>
                      const FlLine(color: Colors.white10, strokeWidth: 1),
                ),
                titlesData: FlTitlesData(
                  show: true,
                  topTitles: const AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                  rightTitles: const AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 44,
                      getTitlesWidget: (value, meta) => Text(
                        value.toStringAsFixed(1),
                        style: const TextStyle(
                          fontSize: 10,
                          color: Colors.white54,
                        ),
                      ),
                    ),
                  ),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 28,
                      // Подписываем только края и середину — иначе даты сливаются
                      interval: (points.length / 3).ceilToDouble().clamp(
                        1,
                        999,
                      ),
                      getTitlesWidget: (value, meta) {
                        final index = value.round();
                        if (index < 0 || index >= points.length) {
                          return const SizedBox.shrink();
                        }
                        final date = points[index].key;
                        return Padding(
                          padding: const EdgeInsets.only(top: 6),
                          child: Text(
                            '${date.day}.${date.month.toString().padLeft(2, '0')}',
                            style: const TextStyle(
                              fontSize: 10,
                              color: Colors.white54,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ),
                borderData: FlBorderData(
                  show: true,
                  border: Border.all(color: Colors.white10),
                ),
                lineTouchData: LineTouchData(
                  touchTooltipData: LineTouchTooltipData(
                    getTooltipItems: (touched) => touched.map((spot) {
                      final date = points[spot.x.round()].key;
                      return LineTooltipItem(
                        '${spot.y}\n${date.day}.${date.month}.${date.year}',
                        const TextStyle(color: Colors.white, fontSize: 12),
                      );
                    }).toList(),
                  ),
                ),
                lineBarsData: [
                  LineChartBarData(
                    spots: spots,
                    isCurved: true,
                    gradient: const LinearGradient(
                      colors: [Colors.blue, Colors.cyan],
                    ),
                    barWidth: 4,
                    isStrokeCapRound: true,
                    dotData: const FlDotData(show: true),
                    belowBarData: BarAreaData(
                      show: true,
                      gradient: LinearGradient(
                        colors: [
                          Colors.blue.withValues(alpha: 0.3),
                          Colors.cyan.withValues(alpha: 0),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
