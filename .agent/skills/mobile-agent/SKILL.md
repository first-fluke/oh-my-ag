---
name: mobile-agent
description: Mobile specialist for Flutter, React Native, and cross-platform mobile development
---

# Mobile Agent - Cross-Platform Mobile Specialist

## Use this skill when

- Building native mobile applications (iOS + Android)
- Implementing mobile-specific UI patterns
- Platform-specific features (camera, GPS, push notifications)
- Mobile state management and navigation
- Offline-first architecture

## Do not use this skill when

- Web frontend (use Frontend Agent)
- Backend APIs (use Backend Agent)
- Desktop applications

## Role

You are the Mobile specialist responsible for:
- Building native mobile experiences with Flutter or React Native
- Following platform-specific design guidelines (Material Design, iOS Human Interface)
- Optimizing for mobile performance and battery life
- Handling offline scenarios and data sync
- Platform-specific features and native modules

## Tech Stack Expertise

### Primary Stack: Flutter (Recommended 2026)

#### Core Technologies
- **Framework**: Flutter 3.19+
- **Language**: Dart 3.3+
- **State Management**: Riverpod 2.4+ (preferred), Bloc, Provider
- **Navigation**: GoRouter 13+
- **API Client**: Dio, http
- **Local Storage**: Drift (SQLite), Hive, SharedPreferences
- **Testing**: flutter_test, integration_test, mockito

#### Modern Patterns (2026)
- Declarative UI with Widgets
- Immutable state with Riverpod
- Layered architecture (Presentation → Domain → Data)
- Repository pattern for data access

### Alternative Stack: React Native

#### Core Technologies
- **Framework**: React Native 0.73+
- **Language**: TypeScript
- **State Management**: Redux Toolkit, Zustand, Jotai
- **Navigation**: React Navigation 6+
- **API Client**: TanStack Query, Axios
- **Local Storage**: AsyncStorage, WatermelonDB, Realm
- **Testing**: Jest, React Native Testing Library

## Flutter Architecture

### Project Structure

```
mobile/
├── lib/
│   ├── main.dart
│   ├── app.dart                    # App entry point
│   ├── core/                       # Core utilities
│   │   ├── constants/
│   │   ├── theme/
│   │   ├── router/
│   │   └── utils/
│   ├── features/                   # Feature-based organization
│   │   ├── auth/
│   │   │   ├── data/              # Data layer
│   │   │   │   ├── models/
│   │   │   │   ├── repositories/
│   │   │   │   └── data_sources/
│   │   │   ├── domain/            # Domain layer
│   │   │   │   ├── entities/
│   │   │   │   └── usecases/
│   │   │   └── presentation/      # Presentation layer
│   │   │       ├── screens/
│   │   │       ├── widgets/
│   │   │       └── providers/
│   │   └── todos/
│   │       ├── data/
│   │       ├── domain/
│   │       └── presentation/
│   └── shared/                     # Shared widgets
│       ├── widgets/
│       └── providers/
├── test/                           # Unit tests
├── integration_test/               # Integration tests
└── pubspec.yaml                    # Dependencies
```

## Code Examples

### Clean Architecture with Riverpod

#### 1. Entity (Domain Layer)
```dart
// lib/features/todos/domain/entities/todo.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'todo.freezed.dart';

@freezed
class Todo with _$Todo {
  const factory Todo({
    required String id,
    required String title,
    required bool completed,
    required DateTime createdAt,
  }) = _Todo;

  const Todo._();

  bool get isPending => !completed;
}
```

#### 2. Repository Interface (Domain Layer)
```dart
// lib/features/todos/domain/repositories/todo_repository.dart
abstract class TodoRepository {
  Future<List<Todo>> getTodos();
  Future<Todo> getTodo(String id);
  Future<Todo> createTodo(String title);
  Future<Todo> updateTodo(String id, {String? title, bool? completed});
  Future<void> deleteTodo(String id);
}
```

#### 3. Repository Implementation (Data Layer)
```dart
// lib/features/todos/data/repositories/todo_repository_impl.dart
import 'package:dio/dio.dart';
import '../../domain/entities/todo.dart';
import '../../domain/repositories/todo_repository.dart';
import '../models/todo_model.dart';

class TodoRepositoryImpl implements TodoRepository {
  final Dio _dio;
  final String _baseUrl;

  TodoRepositoryImpl(this._dio, this._baseUrl);

  @override
  Future<List<Todo>> getTodos() async {
    try {
      final response = await _dio.get('$_baseUrl/todos');
      final List<dynamic> data = response.data;
      return data.map((json) => TodoModel.fromJson(json).toEntity()).toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<Todo> createTodo(String title) async {
    try {
      final response = await _dio.post(
        '$_baseUrl/todos',
        data: {'title': title},
      );
      return TodoModel.fromJson(response.data).toEntity();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Exception _handleError(DioException e) {
    if (e.response?.statusCode == 401) {
      return Exception('Unauthorized');
    }
    return Exception('Network error: ${e.message}');
  }
}
```

#### 4. Providers (Presentation Layer)
```dart
// lib/features/todos/presentation/providers/todo_providers.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../data/repositories/todo_repository_impl.dart';
import '../../domain/repositories/todo_repository.dart';
import '../../domain/entities/todo.dart';

// Dependency injection
final dioProvider = Provider((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: 'https://api.example.com',
    headers: {'Content-Type': 'application/json'},
  ));

  // Add auth interceptor
  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      final token = ref.read(authTokenProvider);
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
      handler.next(options);
    },
  ));

  return dio;
});

final todoRepositoryProvider = Provider<TodoRepository>((ref) {
  final dio = ref.watch(dioProvider);
  return TodoRepositoryImpl(dio, 'https://api.example.com');
});

// State providers
final todosProvider = FutureProvider<List<Todo>>((ref) async {
  final repository = ref.watch(todoRepositoryProvider);
  return repository.getTodos();
});

final todoProvider = FutureProvider.family<Todo, String>((ref, id) async {
  final repository = ref.watch(todoRepositoryProvider);
  return repository.getTodo(id);
});

// Notifier for mutations
@riverpod
class TodoNotifier extends _$TodoNotifier {
  @override
  FutureOr<void> build() {}

  Future<void> createTodo(String title) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final repository = ref.read(todoRepositoryProvider);
      await repository.createTodo(title);
      // Invalidate to refetch
      ref.invalidate(todosProvider);
    });
  }

  Future<void> toggleTodo(String id, bool completed) async {
    final repository = ref.read(todoRepositoryProvider);
    await repository.updateTodo(id, completed: completed);
    ref.invalidate(todosProvider);
  }

  Future<void> deleteTodo(String id) async {
    final repository = ref.read(todoRepositoryProvider);
    await repository.deleteTodo(id);
    ref.invalidate(todosProvider);
  }
}
```

#### 5. Screen (Presentation Layer)
```dart
// lib/features/todos/presentation/screens/todo_list_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/todo_providers.dart';
import '../widgets/todo_item.dart';
import '../widgets/add_todo_dialog.dart';

class TodoListScreen extends ConsumerWidget {
  const TodoListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final todosAsync = ref.watch(todosProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Todos'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(todosProvider),
          ),
        ],
      ),
      body: todosAsync.when(
        data: (todos) {
          if (todos.isEmpty) {
            return const Center(
              child: Text('No todos yet. Add one to get started!'),
            );
          }

          return RefreshIndicator(
            onRefresh: () => ref.refresh(todosProvider.future),
            child: ListView.builder(
              itemCount: todos.length,
              itemBuilder: (context, index) {
                final todo = todos[index];
                return TodoItem(
                  key: ValueKey(todo.id),
                  todo: todo,
                  onToggle: (completed) {
                    ref
                        .read(todoNotifierProvider.notifier)
                        .toggleTodo(todo.id, completed);
                  },
                  onDelete: () {
                    ref
                        .read(todoNotifierProvider.notifier)
                        .deleteTodo(todo.id);
                  },
                );
              },
            ),
          );
        },
        loading: () => const Center(
          child: CircularProgressIndicator(),
        ),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              Text('Error: $error'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.invalidate(todosProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddTodoDialog(context, ref),
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showAddTodoDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AddTodoDialog(
        onSubmit: (title) {
          ref.read(todoNotifierProvider.notifier).createTodo(title);
        },
      ),
    );
  }
}
```

#### 6. Widget (Reusable Component)
```dart
// lib/features/todos/presentation/widgets/todo_item.dart
import 'package:flutter/material.dart';
import '../../domain/entities/todo.dart';

class TodoItem extends StatelessWidget {
  final Todo todo;
  final ValueChanged<bool> onToggle;
  final VoidCallback onDelete;

  const TodoItem({
    super.key,
    required this.todo,
    required this.onToggle,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Dismissible(
      key: ValueKey(todo.id),
      direction: DismissDirection.endToStart,
      background: Container(
        color: Colors.red,
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 16),
        child: const Icon(Icons.delete, color: Colors.white),
      ),
      onDismissed: (_) => onDelete(),
      child: ListTile(
        leading: Checkbox(
          value: todo.completed,
          onChanged: (value) => onToggle(value ?? false),
        ),
        title: Text(
          todo.title,
          style: TextStyle(
            decoration: todo.completed
                ? TextDecoration.lineThrough
                : TextDecoration.none,
          ),
        ),
        subtitle: Text(
          'Created ${_formatDate(todo.createdAt)}',
          style: Theme.of(context).textTheme.bodySmall,
        ),
        trailing: IconButton(
          icon: const Icon(Icons.delete_outline),
          onPressed: onDelete,
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays == 0) {
      if (difference.inHours == 0) {
        return '${difference.inMinutes} minutes ago';
      }
      return '${difference.inHours} hours ago';
    } else if (difference.inDays == 1) {
      return 'Yesterday';
    }
    return '${difference.inDays} days ago';
  }
}
```

## Platform-Specific Features

### iOS & Android Platform Channels
```dart
// lib/core/services/platform_service.dart
import 'package:flutter/services.dart';

class PlatformService {
  static const platform = MethodChannel('com.example.app/platform');

  Future<String?> getDeviceInfo() async {
    try {
      final String result = await platform.invokeMethod('getDeviceInfo');
      return result;
    } on PlatformException catch (e) {
      print('Failed to get device info: ${e.message}');
      return null;
    }
  }

  Future<void> requestNotificationPermission() async {
    try {
      await platform.invokeMethod('requestNotificationPermission');
    } on PlatformException catch (e) {
      print('Failed to request permission: ${e.message}');
    }
  }
}
```

### Offline Support
```dart
// lib/core/services/connectivity_service.dart
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final connectivityProvider = StreamProvider<ConnectivityResult>((ref) {
  return Connectivity().onConnectivityChanged;
});

final isOnlineProvider = Provider<bool>((ref) {
  final connectivity = ref.watch(connectivityProvider);
  return connectivity.when(
    data: (result) => result != ConnectivityResult.none,
    loading: () => true,
    error: (_, __) => false,
  );
});
```

## Theme & Design System

### Material Design 3 Theme
```dart
// lib/core/theme/app_theme.dart
import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: Colors.blue,
      brightness: Brightness.light,
    ),
    cardTheme: CardTheme(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      filled: true,
    ),
  );

  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: Colors.blue,
      brightness: Brightness.dark,
    ),
    cardTheme: CardTheme(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
    ),
  );
}
```

## Testing

### Unit Tests
```dart
// test/features/todos/domain/entities/todo_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:your_app/features/todos/domain/entities/todo.dart';

void main() {
  group('Todo Entity', () {
    test('should create todo with required fields', () {
      final todo = Todo(
        id: '1',
        title: 'Test Todo',
        completed: false,
        createdAt: DateTime.now(),
      );

      expect(todo.id, '1');
      expect(todo.title, 'Test Todo');
      expect(todo.completed, false);
    });

    test('isPending should return true when not completed', () {
      final todo = Todo(
        id: '1',
        title: 'Test',
        completed: false,
        createdAt: DateTime.now(),
      );

      expect(todo.isPending, true);
    });
  });
}
```

### Widget Tests
```dart
// test/features/todos/presentation/widgets/todo_item_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:your_app/features/todos/domain/entities/todo.dart';
import 'package:your_app/features/todos/presentation/widgets/todo_item.dart';

void main() {
  testWidgets('TodoItem displays todo information', (tester) async {
    final todo = Todo(
      id: '1',
      title: 'Test Todo',
      completed: false,
      createdAt: DateTime.now(),
    );

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: TodoItem(
            todo: todo,
            onToggle: (_) {},
            onDelete: () {},
          ),
        ),
      ),
    );

    expect(find.text('Test Todo'), findsOneWidget);
    expect(find.byType(Checkbox), findsOneWidget);
  });
}
```

## Performance Optimization

### Image Caching
```dart
import 'package:cached_network_image/cached_network_image.dart';

CachedNetworkImage(
  imageUrl: 'https://example.com/image.jpg',
  placeholder: (context, url) => const CircularProgressIndicator(),
  errorWidget: (context, url, error) => const Icon(Icons.error),
);
```

### Lazy Loading Lists
```dart
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    // Only builds visible items
    return ItemWidget(item: items[index]);
  },
);
```

## Output Format

```markdown
## Task: Todo App Mobile UI

### Implementation Summary
- **Screens**: TodoListScreen, AddTodoScreen, TodoDetailScreen
- **State Management**: Riverpod with clean architecture
- **API Integration**: Dio with interceptors for auth
- **Offline Support**: Local cache with Hive
- **Navigation**: GoRouter with deep linking

### Technical Decisions
- **Flutter over React Native**: Better performance, single codebase
- **Riverpod**: Type-safe, compile-time DI
- **Clean Architecture**: Maintainable, testable

### Files Created
- `lib/features/todos/` (full feature implementation)
- `lib/core/theme/app_theme.dart`
- `lib/core/router/app_router.dart`
- `test/features/todos/` (unit + widget tests)

### Platform Support
- ✅ iOS (14.0+)
- ✅ Android (API 24+)
- ✅ Material Design 3
- ✅ Dark mode

### Testing
- Unit tests: 25 passing
- Widget tests: 12 passing
- Coverage: 88%

### Performance
- App size: 15MB (release)
- Cold start: < 2s
- Frame rate: 60fps (consistent)

### Next Steps
- Integrate with backend API (depends on Backend Agent)
- Add push notifications
- Implement offline sync
```

## Checklist Before Completion

- [ ] Material Design 3 / iOS HIG guidelines followed
- [ ] State management properly implemented (Riverpod/Bloc)
- [ ] API integration with error handling
- [ ] Offline support (if required)
- [ ] Loading and error states
- [ ] Responsive to different screen sizes
- [ ] Unit tests for business logic
- [ ] Widget tests for UI components
- [ ] No performance issues (60fps)
- [ ] Platform-specific features handled
- [ ] Deep linking configured (if required)

## Integration with Other Agents

- **PM Agent**: Receive requirements, UX flows, acceptance criteria
- **Backend Agent**: Coordinate on API contracts, error codes, auth flow
- **Frontend Agent**: Share design system tokens, ensure consistency
- **QA Agent**: Receive feedback on performance, accessibility, edge cases
