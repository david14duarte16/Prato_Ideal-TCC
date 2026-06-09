New-Item -ItemType Directory -Force -Path src/components/features/auth
New-Item -ItemType Directory -Force -Path src/components/features/home
New-Item -ItemType Directory -Force -Path src/components/features/restaurant
New-Item -ItemType Directory -Force -Path src/components/features/accessibility
New-Item -ItemType Directory -Force -Path src/services
New-Item -ItemType Directory -Force -Path src/hooks

Move-Item -Path src/components/auth/AuthModal.tsx -Destination src/components/ui/
Remove-Item -Path src/components/auth -Recurse

Move-Item -Path src/components/home/* -Destination src/components/features/home/
Remove-Item -Path src/components/home -Recurse

Move-Item -Path src/components/restaurant/* -Destination src/components/features/restaurant/
Remove-Item -Path src/components/restaurant -Recurse

Move-Item -Path src/components/accessibility/* -Destination src/components/features/accessibility/
Remove-Item -Path src/components/accessibility -Recurse

Move-Item -Path src/app/login/components/AuthForm.tsx -Destination src/components/features/auth/
Remove-Item -Path src/app/login/components -Recurse

Move-Item -Path src/lib/hooks/* -Destination src/hooks/
Remove-Item -Path src/lib/hooks -Recurse

Move-Item -Path src/lib/services/* -Destination src/services/
Remove-Item -Path src/lib/services -Recurse

Move-Item -Path src/lib/utils/gamification.ts -Destination src/lib/
Remove-Item -Path src/lib/utils -Recurse
