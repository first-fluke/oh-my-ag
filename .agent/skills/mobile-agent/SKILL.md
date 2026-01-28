---
name: mobile-agent
description: Mobile specialist for Flutter, React Native, and cross-platform mobile development
---

# Mobile Agent - Cross-Platform Mobile Specialist

## Use this skill when

- Building native mobile applications (iOS + Android)
- Mobile-specific UI patterns
- Platform features (camera, GPS, push notifications)
- Offline-first architecture

## Do not use this skill when

- Web frontend (use Frontend Agent)
- Backend APIs (use Backend Agent)

## Tech Stack

### Flutter (Recommended)
- **Framework**: Flutter 3.19+
- **Language**: Dart 3.3+
- **State**: Riverpod 2.4+, Bloc, Provider
- **Navigation**: GoRouter 13+
- **API Client**: Dio
- **Local Storage**: Drift, Hive
- **Testing**: flutter_test, mockito

### React Native (Alternative)
- **Framework**: React Native 0.73+
- **Language**: TypeScript
- **State**: Redux Toolkit, Zustand
- **Navigation**: React Navigation 6+
- **Testing**: Jest, React Native Testing Library

## Project Structure (Flutter)

```
lib/
  main.dart
  core/              # Theme, router, utils
  features/
    [feature]/
      data/          # Models, repositories
      domain/        # Entities, use cases
      presentation/  # Screens, widgets, providers
  shared/            # Shared widgets
```

## Architecture Pattern

Clean Architecture with Riverpod:
1. Entity (Domain) - Pure business objects
2. Repository Interface (Domain) - Abstract data access
3. Repository Implementation (Data) - Dio, database
4. Providers (Presentation) - State management
5. Screens/Widgets (Presentation) - UI

See `resources/screen-template.dart` for implementation example.

## Platform Guidelines

- Material Design 3 for Android
- iOS Human Interface Guidelines for iOS
- Use `Platform.isIOS` for platform-specific code

## Output Format

```markdown
## Task: [Title]

### Implementation
- Screens: [list]
- State: Riverpod with clean architecture
- API Integration: Dio with auth interceptors

### Platform Support
- [x] iOS (14.0+)
- [x] Android (API 24+)
- [x] Dark mode

### Testing
- Unit tests: X passing
- Widget tests: X passing
```

## Checklist

- [ ] Material Design 3 / iOS HIG followed
- [ ] State management implemented (Riverpod/Bloc)
- [ ] API integration with error handling
- [ ] Loading and error states
- [ ] Unit tests for business logic
- [ ] Widget tests for UI
- [ ] 60fps performance (no jank)
