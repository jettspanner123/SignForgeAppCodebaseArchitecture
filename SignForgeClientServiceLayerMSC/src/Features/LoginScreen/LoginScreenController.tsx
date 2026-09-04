import React, { useState } from 'react';
import LoginScreenCardStaticComponent from './Components/static/LoginScreenCardStaticComponent';
import LoginScreenCON from './Constants/LoginScreenCON';
import { LoginCredentials, LoginFormErrors, LoginAuthState } from './Models/LoginScreenModel';
import LoginScreenService from './Services/LoginScreenService';
import TanstackQueryClientService from '../../Services/TanstackQueryClientService';
import ENValidator from '../../Utilities/ENValidator';

export interface LoginScreenControllerProps {
  currentTheme: string;
  onToggleTheme: () => void;
  onLoginSuccess: (authState: LoginAuthState) => void;
  onNavigateForgotPassword?: () => void;
}

export default function LoginScreenController({
  currentTheme,
  onToggleTheme,
  onLoginSuccess,
  onNavigateForgotPassword,
}: LoginScreenControllerProps): React.JSX.Element {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: true,
  });

  const [errors, setErrors] = useState<LoginFormErrors>({});

  let isDevelopmentMode = false;
  try {
    const envMode =
      ENValidator.current.getOptionalValue('SIGNFORGE_CLIENT_ENV_MODE') ||
      ENValidator.current.getOptionalValue('VITE_SIGNFORGE_CLIENT_ENV_MODE') ||
      import.meta.env.MODE ||
      '';
    isDevelopmentMode = envMode.toLowerCase() === 'development';
  } catch {
    isDevelopmentMode = false;
  }

  const loginMutation = TanstackQueryClientService.current.authentication.loginMutation({
    onSuccess: (authState) => {
      onLoginSuccess(authState);
    },
    onError: (err: Error) => {
      setErrors({ general: err.message });
    },
  });

  const microsoftLoginMutation = TanstackQueryClientService.current.authentication.microsoftLoginMutation({
    onSuccess: (authState) => {
      onLoginSuccess(authState);
    },
    onError: (err: Error) => {
      setErrors({ general: err.message });
    },
  });

  const handleQuickDevLogin = () => {
    setErrors({});
    loginMutation.mutate({
      email: 'hr@theweplm.com',
      password: 'SignForge@2026',
      rememberMe: true,
    });
  };

  const handleFieldChange = (field: keyof LoginCredentials, value: string | boolean) => {
    setCredentials((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field as keyof LoginFormErrors] || errors.general) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
        general: undefined,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = LoginScreenService.current.validate(credentials);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    loginMutation.mutate(credentials);
  };

  const handleMicrosoftLogin = () => {
    setErrors({});
    microsoftLoginMutation.mutate();
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-black sm:bg-slate-50 sm:dark:bg-[#000000] text-slate-900 dark:text-zinc-100 flex flex-col justify-between relative overflow-hidden transition-colors selection:bg-[#0C2086]/20">
      {/* Ambient background glow effects matching DESIGN.md */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#0C2086]/10 dark:from-[#0C2086]/20 to-transparent blur-3xl pointer-events-none -z-0" />
      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-t from-sky-500/5 dark:from-indigo-900/10 to-transparent blur-3xl pointer-events-none -z-0" />

      {/* Main Centered Form Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-0 sm:p-6">
        <LoginScreenCardStaticComponent
          credentials={credentials}
          errors={errors}
          isLoading={loginMutation.isPending}
          isMicrosoftLoading={microsoftLoginMutation.isPending}
          isDevelopmentMode={isDevelopmentMode}
          onQuickDevLogin={handleQuickDevLogin}
          currentTheme={currentTheme}
          onToggleTheme={onToggleTheme}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          onMicrosoftLogin={handleMicrosoftLogin}
          onNavigateForgotPassword={onNavigateForgotPassword}
        />
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 w-full px-6 py-4 text-center text-xs text-slate-400 dark:text-zinc-600 font-mono">
        <p>{LoginScreenCON.COPYRIGHT_TEXT}</p>
      </footer>
    </div>
  );
}
