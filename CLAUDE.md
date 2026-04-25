# PMA Frontend - Project Management Application

## Descriere Proiect
Aplicație mobile React Native pentru managementul proiectelor, dezvoltată cu Expo și TypeScript.

## Stack Tehnologic

### Core
- **React Native** 0.81.5 + **React** 19.1.0
- **Expo** ~54.0.23
- **TypeScript** ~5.9.2
- **Expo Router** ~6.0.14 (navigare)

### State Management & Data Fetching
- **TanStack React Query** ^5.90.19 (server state)
- **Axios** ^1.13.2 (HTTP client)
- **React Hook Form** ^7.68.0 (formulare)
- **Zod** ^4.1.13 (validare schema)

### Features
- **Socket.io Client** ^4.8.3 (real-time communication)
- **Expo Notifications** ^0.32.15
- **Expo Image Picker** ~17.0.9
- **Expo Secure Store** ^15.0.8 (stocare securizată)
- **React Native Calendars** ^1.1313.0
- **JWT Decode** ^4.0.0 (autentificare)

### UI/UX
- **Expo Linear Gradient** ^15.0.8
- **React Native SVG** 15.12.1
- **React Native Toast Message** ^2.3.3
- **React Native Circular Progress Indicator** ^4.4.2

## Structură Proiect
```
pma-frontend/
├── app/              # Expo Router pages
├── components/       # Componente reutilizabile
├── contexts/         # React Context providers
├── hooks/            # Custom hooks
├── api/              # API client & endpoints
└── assets/           # Imagini, fonturi, etc.
```

## Comenzi Principale
```bash
npm start          # Pornește Expo dev server
npm run android    # Rulează pe Android
npm run ios        # Rulează pe iOS
npm run web        # Rulează în browser
npm run lint       # ESLint check
```

## Configurare Mediu
- Fișier: `.env`
- Exemple: `.env.example`
- Variabile necesare: API_URL, CLOUDINARY_CONFIG, etc.

## Convenții de Cod

### TypeScript
- Utilizează tipuri stricte
- Evită `any` - preferă `unknown` sau tipuri specifice
- Definește interfețe pentru toate obiectele complexe

### Componente
- Componente funcționale cu hooks
- Props cu TypeScript interfaces
- Naming: PascalCase pentru componente

### Styling
- Utilizează StyleSheet.create pentru performanță
- Evită inline styles în JSX
- Folosește theme/design tokens pentru culori și spacing

### Forms & Validation
- React Hook Form pentru toate formularele
- Zod schema pentru validare
- Hookform Resolvers pentru integrare

### API Calls
- TanStack Query pentru toate cererile server
- Axios pentru HTTP client configurat
- Error handling centralizat

### Real-time
- Socket.io pentru evenimente real-time
- Reconnection logic implementat
- Event listeners în useEffect cu cleanup

## Reguli Importante

### Performance
- Evită re-renders inutile (React.memo, useMemo, useCallback)
- Lazy loading pentru route-uri și imagini mari
- Optimizează liste lungi cu FlatList/SectionList

### Security
- Nu stoca date sensibile în AsyncStorage
- Utilizează Expo SecureStore pentru tokens
- Validează toate input-urile user
- Sanitizează date înainte de afișare

### Error Handling
- Try-catch pentru toate operațiunile async
- Toast messages pentru feedback user
- Logging pentru debugging

### Git Workflow
- Branch-uri: feature/nume-feature, fix/nume-bug
- Commit messages descriptive
- Pull requests pentru review

## Integrări
- **Backend API**: pma-nest-backend (NestJS)
- **Cloudinary**: Upload și management imagini
- **Push Notifications**: Expo Notifications

## Testing
- Configurare: eslint pentru linting
- TODO: Jest pentru unit tests
- TODO: Detox pentru E2E testing

## Notes
- Proiect privat, nu pentru publicare
- Main entry point: expo-router/entry
