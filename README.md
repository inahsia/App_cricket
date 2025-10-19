# Red Ball Cricket Academy

This repository contains a full-stack project for the Red Ball Cricket Academy:

- `backend/`: Django backend API (DRF)
- `RedBallCricketAppNew_new/`: React Native mobile app (TypeScript)
- `backup_src/`: Backup of original mobile `src/` code used to migrate into the new app

## Mobile App (React Native)
- React Native: 0.70.x
- TypeScript template
- Navigation: `@react-navigation/*`
- Storage: `@react-native-async-storage/async-storage`
- UI: `react-native-elements`, `react-native-vector-icons`

### Run (Android)
1. Start Metro bundler (optional if `npm run android` starts it automatically)
```bash
npm start
```
2. Build, install and run on Android emulator/device
```bash
npm run android
```

### API base URL
- Development (Android emulator): `http://10.0.2.2:8000/api`
- Update `src/config/api.ts` if your backend host/port differs.

## Backend (Django)
### Prerequisites
- Python 3.10+
- pip

### Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

## Notes
- Android build cache may require `cd android && gradlew clean` after dependency changes.
- `.gitignore` excludes large build folders, logs, venv, and secrets.

## License
TBD
