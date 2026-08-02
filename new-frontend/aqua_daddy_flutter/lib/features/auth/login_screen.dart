import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:aqua_daddy_flutter/features/auth/auth_provider.dart';
import 'package:aqua_daddy_flutter/core/app_header.dart';
import 'package:aqua_daddy_flutter/l10n/app_localizations.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  // Apple-first on iOS/macOS, Google-first everywhere else
  bool _showApple = !kIsWeb && (Platform.isIOS || Platform.isMacOS);

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final notifier = ref.read(authProvider.notifier);
    final l10n = AppLocalizations.of(context)!;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final btnBg = isDark ? const Color(0xFF162840) : const Color(0xFFDFF7F9);
    final titleColor = isDark ? const Color(0xFFE2E8F0) : const Color(0xFF05222B);

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: const AppHeader(),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(14),
                  color: isDark ? const Color(0xFF0F2030).withValues(alpha: 0.95) : const Color(0xFFEAF9FA).withValues(alpha: 0.95),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 20, offset: const Offset(0, 10)),
                  ],
                  border: Border.all(color: isDark ? const Color(0xFF1E3A50) : Colors.white.withValues(alpha: 0.6)),
                ),
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(26, 26, 26, 28),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        l10n.loginTitle,
                        style: GoogleFonts.tektur(fontSize: 34, fontWeight: FontWeight.w700, color: titleColor),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        l10n.loginSubtitle,
                        style: GoogleFonts.montserrat(fontSize: 14, color: const Color(0xFF6A8A90), fontWeight: FontWeight.w500),
                      ),
                      const SizedBox(height: 22),

                      Text(
                        l10n.signInMethod,
                        style: GoogleFonts.montserrat(fontSize: 13, color: const Color(0xFF6A8A90)),
                      ),
                      const SizedBox(height: 12),

                      // Main sign-in button — switches between Google and Apple
                      AnimatedSwitcher(
                        duration: const Duration(milliseconds: 250),
                        child: _showApple
                            ? _AppleButton(key: const ValueKey('apple'), isDark: isDark, btnBg: btnBg, isLoading: authState.isLoading, onTap: () => notifier.signInWithApple(), l10n: l10n)
                            : _GoogleButton(key: const ValueKey('google'), isDark: isDark, btnBg: btnBg, isLoading: authState.isLoading, onTap: () => notifier.signInWithGoogle(), l10n: l10n),
                      ),

                      const SizedBox(height: 18),

                      // "Try another method" — toggles between Google / Apple
                      Center(
                        child: TextButton(
                          onPressed: authState.isLoading ? null : () => setState(() => _showApple = !_showApple),
                          style: TextButton.styleFrom(
                            foregroundColor: const Color(0xFF00A8D8),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                _showApple ? Icons.g_mobiledata_rounded : Icons.apple_rounded,
                                size: 18,
                                color: const Color(0xFF00A8D8),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                l10n.tryAnotherMethod,
                                style: GoogleFonts.montserrat(fontWeight: FontWeight.w600, fontSize: 13, color: const Color(0xFF00A8D8)),
                              ),
                            ],
                          ),
                        ),
                      ),

                      if (authState.error != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: Text(authState.error!, style: const TextStyle(color: Colors.red, fontSize: 13)),
                        ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ── Google sign-in button ─────────────────────────────────────────────────────
class _GoogleButton extends StatelessWidget {
  final bool isDark;
  final Color btnBg;
  final bool isLoading;
  final VoidCallback onTap;
  final AppLocalizations l10n;

  const _GoogleButton({
    super.key,
    required this.isDark,
    required this.btnBg,
    required this.isLoading,
    required this.onTap,
    required this.l10n,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: isLoading ? null : onTap,
      child: Opacity(
        opacity: isLoading ? 0.6 : 1.0,
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 14),
          margin: const EdgeInsets.symmetric(horizontal: 6),
          decoration: BoxDecoration(
            color: btnBg,
            borderRadius: BorderRadius.circular(10),
            boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 6))],
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF0F2030) : Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 6, offset: const Offset(0, 3))],
                ),
                child: Center(
                  child: Container(
                    width: 34,
                    height: 34,
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF162840) : const Color(0xFFEAF9FA),
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFF0165A9), width: 2),
                    ),
                    child: Center(
                      child: Text('G', style: GoogleFonts.tektur(fontSize: 20, color: const Color(0xFF0165A9))),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Text(
                  l10n.googleSignIn,
                  style: GoogleFonts.montserrat(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: isDark ? const Color(0xFFE2E8F0) : const Color(0xFF05222B),
                  ),
                ),
              ),
              if (isLoading)
                const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF00A8D8))),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Apple sign-in button ──────────────────────────────────────────────────────
class _AppleButton extends StatelessWidget {
  final bool isDark;
  final Color btnBg;
  final bool isLoading;
  final VoidCallback onTap;
  final AppLocalizations l10n;

  const _AppleButton({
    super.key,
    required this.isDark,
    required this.btnBg,
    required this.isLoading,
    required this.onTap,
    required this.l10n,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: isLoading ? null : onTap,
      child: Opacity(
        opacity: isLoading ? 0.6 : 1.0,
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 14),
          margin: const EdgeInsets.symmetric(horizontal: 6),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1A1A2E) : const Color(0xFF1C1C1E),
            borderRadius: BorderRadius.circular(10),
            boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.12), blurRadius: 8, offset: const Offset(0, 6))],
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.apple_rounded, color: Colors.white, size: 28),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Text(
                  l10n.appleSignIn,
                  style: GoogleFonts.montserrat(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white),
                ),
              ),
              if (isLoading)
                const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)),
            ],
          ),
        ),
      ),
    );
  }
}
