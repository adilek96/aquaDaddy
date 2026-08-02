import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Holds the currently selected app locale. Default: English
final localeProvider = StateProvider<Locale>((ref) => const Locale('en'));
