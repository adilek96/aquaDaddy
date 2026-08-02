import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'dart:convert';
import 'package:aqua_daddy_flutter/core/api_client.dart';
import 'package:dio/dio.dart';

class AuthState {
  final bool isLoading;
  final String? error;
  final Map<String, dynamic>? user;

  AuthState({this.isLoading = false, this.error, this.user});

  bool get isAuthenticated => user != null;

  AuthState copyWith({bool? isLoading, String? error, Map<String, dynamic>? user}) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      user: user ?? this.user,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final Dio _api;

  AuthNotifier(this._api) : super(AuthState()) {
    _checkInit();
  }

  Future<void> _checkInit() async {
    state = state.copyWith(isLoading: true);
    try {
      final prefs = await SharedPreferences.getInstance();
      final userData = prefs.getString('user_data');
      if (userData != null) {
        state = state.copyWith(user: jsonDecode(userData), isLoading: false);
      } else {
        state = state.copyWith(isLoading: false);
      }
    } catch (e) {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true);
    try {
      final response = await _api.post('/auth/login', data: {
        'email': email,
        'password': password,
      });
      final data = response.data;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', data['token']);
      await prefs.setString('user_data', jsonEncode(data['user']));
      state = state.copyWith(user: data['user'], isLoading: false);
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.response?.data['error'] ?? "Login failed",
      );
    }
  }

  Future<void> register(String name, String email, String password) async {
    state = state.copyWith(isLoading: true);
    try {
      final response = await _api.post('/auth/register', data: {
        'name': name,
        'email': email,
        'password': password,
      });
      final data = response.data;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', data['token']);
      await prefs.setString('user_data', jsonEncode(data['user']));
      state = state.copyWith(user: data['user'], isLoading: false);
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.response?.data['error'] ?? "Registration failed",
      );
    }
  }

  Future<void> signInWithGoogle() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      // serverClientId = web client ID from Google Cloud Console.
      // Required on Android to receive an idToken that the backend can verify.
      final gClientId = dotenv.env['GOOGLE_CLIENT_ID'] ??
          '40814483618-b6q8nf3c761vf8fal1gk8jd7ifvvhq94.apps.googleusercontent.com';
      final googleSignIn = GoogleSignIn(
        scopes: ['email', 'profile'],
        clientId: kIsWeb ? gClientId : null,
        serverClientId: kIsWeb ? null : gClientId,
      );

      // Sign out first to force account picker every time
      await googleSignIn.signOut();

      final GoogleSignInAccount? googleUser = await googleSignIn.signIn();
      if (googleUser == null) {
        state = state.copyWith(isLoading: false);
        return;
      }

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final idToken = googleAuth.idToken;

      if (idToken == null) {
        state = state.copyWith(
          isLoading: false,
          error: 'Google Sign-In: idToken не получен. '
              'Убедитесь, что Android-приложение зарегистрировано в Google Cloud Console '
              '(package: com.example.aqua_daddy_flutter, SHA-1: 68:AB:C4:8D:70:05:0D:1F:57:C7:24:CF:00:A4:6E:93:D0:C1:05:E4)',
        );
        return;
      }

      final response = await _api.post('/auth/social', data: {
        'idToken': idToken,
        'provider': 'google',
      });

      final data = response.data;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', data['token']);
      await prefs.setString('user_data', jsonEncode(data['user']));

      state = state.copyWith(user: data['user'], isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e is DioException
            ? (e.response?.data['error'] ?? "Google login failed")
            : "Google login failed: $e",
      );
    }
  }

  Future<void> signInWithApple() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final credential = await SignInWithApple.getAppleIDCredential(
        scopes: [AppleIDAuthorizationScopes.email, AppleIDAuthorizationScopes.fullName],
      );

      final idToken = credential.identityToken;
      if (idToken == null) {
        state = state.copyWith(isLoading: false, error: "Failed to get Apple identity token");
        return;
      }

      // Имя Apple отдаёт только при первом входе — передаём его сразу,
      // иначе потом взять его будет неоткуда
      final appleName = [credential.givenName, credential.familyName]
          .whereType<String>()
          .join(' ')
          .trim();

      final response = await _api.post('/auth/social', data: {
        'idToken': idToken,
        'provider': 'apple',
        if (appleName.isNotEmpty) 'name': appleName,
      });

      final data = response.data;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', data['token']);
      await prefs.setString('user_data', jsonEncode(data['user']));

      state = state.copyWith(user: data['user'], isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e is DioException
            ? (e.response?.data['error'] ?? "Apple login failed")
            : "Apple login failed: $e",
      );
    }
  }

  Future<void> logout() async {
    try {
      await _api.post('/auth/logout');
    } finally {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('auth_token');
      await prefs.remove('user_data');

      final gClientId = dotenv.env['GOOGLE_CLIENT_ID'] ??
          '40814483618-b6q8nf3c761vf8fal1gk8jd7ifvvhq94.apps.googleusercontent.com';
      final googleSignIn = GoogleSignIn(
        clientId: kIsWeb ? gClientId : null,
        serverClientId: kIsWeb ? null : gClientId,
      );
      if (await googleSignIn.isSignedIn()) {
        await googleSignIn.signOut();
      }
      state = AuthState();
    }
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.watch(apiClientProvider));
});
