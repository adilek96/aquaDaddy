import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:aqua_daddy_flutter/features/auth/auth_provider.dart';
import 'package:aqua_daddy_flutter/features/auth/login_screen.dart';
import 'package:aqua_daddy_flutter/features/dashboard/dashboard_screen.dart';
import 'package:aqua_daddy_flutter/features/home/home_screen.dart';
import 'package:aqua_daddy_flutter/features/discovery/discovery_screen.dart';
import 'package:aqua_daddy_flutter/features/profile/profile_screen.dart';
import 'package:aqua_daddy_flutter/features/aquarium/add_aquarium_screen.dart';
import 'package:aqua_daddy_flutter/features/aquarium/aquarium_detail_screen.dart';
import 'package:aqua_daddy_flutter/features/aquarium/water_log_screen.dart';
import 'package:aqua_daddy_flutter/features/aquarium/history_chart_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final isAuthenticated = authState.isAuthenticated;
      final loc = state.uri.path;

      const protectedPrefixes = <String>[
        '/dashboard',
        '/add',
        '/aquarium',
        '/profile',
        '/admin',
        '/comments',
        '/maintenance',
      ];

      final isProtected = protectedPrefixes.any((p) => loc.startsWith(p));

      // Unauthenticated trying to access protected route → login
      if (!isAuthenticated && isProtected) return '/login';

      // Authenticated user on login or home → dashboard
      if (isAuthenticated && (loc == '/login' || loc == '/')) {
        return '/dashboard';
      }

      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(
        path: '/',
        builder: (context, state) => const HomeScreen(),
        routes: [
          GoRoute(
            path: 'add',
            builder: (context, state) => const AddAquariumScreen(),
          ),
          GoRoute(
            path: 'aquarium/:id',
            builder: (context, state) {
              final id = state.pathParameters['id']!;
              return AquariumDetailScreen(aquariumId: id);
            },
            routes: [
              GoRoute(
                path: 'log',
                builder: (context, state) {
                  final id = state.pathParameters['id']!;
                  return WaterLogScreen(aquariumId: id);
                },
              ),
              GoRoute(
                path: 'chart',
                builder: (context, state) {
                  final id = state.pathParameters['id']!;
                  return HistoryChartScreen(aquariumId: id);
                },
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: '/dashboard',
        builder: (context, state) => const DashboardScreen(),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfileScreen(),
      ),
      GoRoute(
        path: '/discovery',
        builder: (context, state) => const DiscoveryScreen(),
      ),
    ],
  );
});
