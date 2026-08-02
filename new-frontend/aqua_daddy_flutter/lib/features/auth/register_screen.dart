import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

// Registration is not supported in this app (OAuth-only).
// This stub redirects users to the login screen if accidentally navigated here.
class RegisterScreen extends StatelessWidget {
  const RegisterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Redirect to login immediately
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!context.mounted) return;
      GoRouter.of(context).go('/login');
    });

    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.info_outline, size: 56, color: Colors.blueAccent),
              const SizedBox(height: 16),
              const Text(
                'Registration is disabled. Use Google or Apple sign-in on the Login screen.',
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () => GoRouter.of(context).go('/login'),
                child: const Text('Go to Login'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
