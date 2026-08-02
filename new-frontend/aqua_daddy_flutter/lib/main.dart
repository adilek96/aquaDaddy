import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:aqua_daddy_flutter/l10n/app_localizations.dart';
import 'package:aqua_daddy_flutter/core/app_router.dart';
import 'package:aqua_daddy_flutter/core/design_system.dart';
import 'package:aqua_daddy_flutter/core/locale_provider.dart';
import 'package:aqua_daddy_flutter/core/theme_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: '.env', isOptional: true);
  runApp(
    const ProviderScope(
      child: AquaDaddyApp(),
    ),
  );
}

class AquaDaddyApp extends ConsumerWidget {
  const AquaDaddyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    final locale = ref.watch(localeProvider);
    final themeMode = ref.watch(themeModeProvider);

    // Web uses Tektur (aliased as --font-bebas); Flutter uses GoogleFonts.tektur()
    final lightBase = GoogleFonts.montserratTextTheme(ThemeData.light().textTheme);
    final lightTextTheme = lightBase.copyWith(
      headlineLarge: GoogleFonts.tektur(textStyle: lightBase.headlineLarge?.copyWith(fontSize: 34, fontWeight: FontWeight.w800)),
      headlineMedium: GoogleFonts.tektur(textStyle: lightBase.headlineMedium?.copyWith(fontSize: 28, fontWeight: FontWeight.w700)),
    );

    final darkBase = GoogleFonts.montserratTextTheme(ThemeData.dark().textTheme);
    final darkTextTheme = darkBase.copyWith(
      headlineLarge: GoogleFonts.tektur(textStyle: darkBase.headlineLarge?.copyWith(fontSize: 34, fontWeight: FontWeight.w800)),
      headlineMedium: GoogleFonts.tektur(textStyle: darkBase.headlineMedium?.copyWith(fontSize: 28, fontWeight: FontWeight.w700)),
    );

    return MaterialApp.router(
      title: 'aquaDaddy',
      debugShowCheckedModeBanner: false,
      routerConfig: router,
      locale: locale,
      themeMode: themeMode,
      // Global gradient background — switches with theme
      builder: (context, child) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: isDark
                  ? const [
                      Color(0xFF0D1B2A), // dark navy
                      Color(0xFF0A1F2E), // dark cyan-navy
                      Color(0xFF0B1E1E), // dark teal
                    ]
                  : const [
                      Color(0xFFEFF6FF), // blue-50
                      Color(0xFFECFEFF), // cyan-50
                      Color(0xFFF0FDFA), // teal-50
                    ],
            ),
          ),
          child: child!,
        );
      },
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        colorScheme: dsLightColorScheme,
        textTheme: lightTextTheme,
        scaffoldBackgroundColor: Colors.transparent,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.transparent,
          foregroundColor: Color(0xFF05222B),
          elevation: 0,
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: Color(0xFFEAF9FA),
        ),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        colorScheme: dsDarkColorScheme,
        textTheme: darkTextTheme,
        scaffoldBackgroundColor: Colors.transparent,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.transparent,
          foregroundColor: Color(0xFFE2E8F0),
          elevation: 0,
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: Color(0xFF0D2233),
        ),
        cardColor: const Color(0xFF0A1628),
        popupMenuTheme: const PopupMenuThemeData(
          color: Color(0xFF0F2030),
          surfaceTintColor: Colors.transparent,
        ),
      ),
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('en'),
        Locale('ru'),
        Locale('az'),
      ],
    );
  }
}
