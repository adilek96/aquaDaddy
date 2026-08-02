import 'package:flutter/material.dart';

/// Поле выбора даты и времени. Раньше даты нигде не выбирались:
/// обслуживание всегда писалось «сейчас», напоминание — ровно через 24 часа.
class DateTimeField extends StatelessWidget {
  final String label;
  final DateTime value;
  final DateTime firstDate;
  final DateTime lastDate;
  final ValueChanged<DateTime> onChanged;

  const DateTimeField({
    super.key,
    required this.label,
    required this.value,
    required this.firstDate,
    required this.lastDate,
    required this.onChanged,
  });

  Future<void> _pick(BuildContext context) async {
    final date = await showDatePicker(
      context: context,
      initialDate: value,
      firstDate: firstDate,
      lastDate: lastDate,
    );
    if (date == null || !context.mounted) return;

    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(value),
    );
    if (!context.mounted) return;

    onChanged(
      DateTime(
        date.year,
        date.month,
        date.day,
        time?.hour ?? value.hour,
        time?.minute ?? value.minute,
      ),
    );
  }

  String get _formatted {
    String two(int n) => n.toString().padLeft(2, '0');
    return '${two(value.day)}.${two(value.month)}.${value.year} '
        '${two(value.hour)}:${two(value.minute)}';
  }

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => _pick(context),
      borderRadius: BorderRadius.circular(12),
      child: InputDecorator(
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          suffixIcon: const Icon(Icons.calendar_today, size: 18),
        ),
        child: Text(_formatted),
      ),
    );
  }
}
