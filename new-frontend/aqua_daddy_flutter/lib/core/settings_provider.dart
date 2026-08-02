import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SettingsState {
  final bool isMetric; // true = metric (liters/cm), false = imperial
  final bool isCelsius; // true = °C, false = °F

  const SettingsState({this.isMetric = true, this.isCelsius = true});

  SettingsState copyWith({bool? isMetric, bool? isCelsius}) => SettingsState(
    isMetric: isMetric ?? this.isMetric,
    isCelsius: isCelsius ?? this.isCelsius,
  );
}

class SettingsNotifier extends AsyncNotifier<SettingsState> {
  @override
  Future<SettingsState> build() async {
    final prefs = await SharedPreferences.getInstance();
    final isMetric =
        (prefs.getString('measurement_system') ?? 'metric') != 'imperial';
    final isCelsius = (prefs.getString('temperature_scales') ?? 'c') != 'f';
    return SettingsState(isMetric: isMetric, isCelsius: isCelsius);
  }

  Future<void> setMeasurement(bool isMetric) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      'measurement_system',
      isMetric ? 'metric' : 'imperial',
    );
    state = AsyncValue.data(
      (state.value ?? const SettingsState()).copyWith(isMetric: isMetric),
    );
  }

  Future<void> setTemperature(bool isCelsius) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('temperature_scales', isCelsius ? 'c' : 'f');
    state = AsyncValue.data(
      (state.value ?? const SettingsState()).copyWith(isCelsius: isCelsius),
    );
  }
}

final settingsProvider = AsyncNotifierProvider<SettingsNotifier, SettingsState>(
  SettingsNotifier.new,
);
