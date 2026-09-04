import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Sun, Moon } from 'lucide-react';
import ButtonSharedComponent from '../../../../Shared/Components/ButtonSharedComponent';
import LoginScreenCON from '../../Constants/LoginScreenCON';
import { LoginCredentials, LoginFormErrors } from '../../Models/LoginScreenModel';
import weplmLogo from '@/src/Assets/weplm.jpeg';
import ApplicationHapticsUtility from '../../../../Utilities/ApplicationHapticsUtility';
import ApplicationThemeUtility from '../../../../Utilities/ApplicationThemeUtility';
import ApplicationThemeCON from '../../../../Constants/ApplicationThemeCON';

export interface LoginScreenCardStaticComponentProps {
  credentials: LoginCredentials;
  errors: LoginFormErrors;
  isLoading: boolean;
  isMicrosoftLoading: boolean;
  currentTheme: string;
  onToggleTheme: () => void;
  onFieldChange: (field: keyof LoginCredentials, value: string | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onMicrosoftLogin: () => void;
  onNavigateForgotPassword?: () => void;
}

export default function LoginScreenCardStaticComponent({
  credentials,
  errors,
  isLoading,
  isMicrosoftLoading,
  currentTheme,
  onToggleTheme,
  onFieldChange,
  onSubmit,
  onMicrosoftLogin,
  onNavigateForgotPassword,
}: LoginScreenCardStaticComponentProps): React.JSX.Element {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const isDark = currentTheme === ApplicationThemeCON.DARK;

  return (
    <div className="w-full max-w-md bg-transparent sm:bg-white sm:dark:bg-[#0a0a0c] border-0 sm:border border-slate-200 dark:border-zinc-800/90 rounded-none sm:rounded-2xl p-4 sm:p-8 shadow-none sm:shadow-2xl backdrop-blur-none sm:backdrop-blur-xl relative z-10 transition-colors">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 mb-3 shadow-md bg-white dark:bg-zinc-900">
          <img src={weplmLogo} alt="We.PLM Logo" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 font-serif-headline">
          {LoginScreenCON.CARD_TITLE}
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          {LoginScreenCON.CARD_DESCRIPTION}
        </p>
      </div>

      {/* General Error Banner */}
      {errors.general && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium text-left">
          {errors.general}
        </div>
      )}

      {/* Segmented Theme Mode Toggle (Above Microsoft SSO) */}
      <div className="mb-3">
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 h-11 sm:h-9 w-full">
          <button
            type="button"
            onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
            onClick={(e) =>
              isDark &&
              ApplicationThemeUtility.current.executeAnimatedThemeToggle(
                e.currentTarget,
                onToggleTheme
              )
            }
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 h-9 sm:h-7 rounded-lg sm:rounded-md text-xs font-bold transition-all cursor-pointer ${
              !isDark
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Light Mode</span>
          </button>
          <button
            type="button"
            onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
            onClick={(e) =>
              !isDark &&
              ApplicationThemeUtility.current.executeAnimatedThemeToggle(
                e.currentTarget,
                onToggleTheme
              )
            }
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 h-9 sm:h-7 rounded-lg sm:rounded-md text-xs font-bold transition-all cursor-pointer ${
              isDark
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Dark Mode</span>
          </button>
        </div>
      </div>

      {/* Microsoft SSO Action */}
      <div className="mb-5">
        <button
          type="button"
          onClick={() => {
            ApplicationHapticsUtility.current.triggerHapticFeedback(10);
            onMicrosoftLogin();
          }}
          disabled={isLoading || isMicrosoftLoading}
          className="w-full !h-11 sm:!h-9 flex items-center justify-center gap-3 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80 text-slate-700 dark:text-zinc-200 text-sm sm:text-xs font-semibold transition-all shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* Microsoft 4-Color Tile Icon */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="9" height="9" fill="#F25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
            <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
          </svg>
          <span>{isMicrosoftLoading ? 'Connecting to Microsoft Azure...' : LoginScreenCON.MICROSOFT_SSO_LABEL}</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-zinc-800" />
        </div>
        <span className="relative px-3 bg-white dark:bg-black sm:dark:bg-[#0a0a0c] text-[10px] uppercase font-mono tracking-wider text-slate-400 dark:text-zinc-500">
          {LoginScreenCON.DIVIDER_TEXT}
        </span>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4 text-left">
        {/* Email Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 font-sans">
            {LoginScreenCON.EMAIL_LABEL}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => onFieldChange('email', e.target.value)}
              placeholder={LoginScreenCON.EMAIL_PLACEHOLDER}
              autoComplete="email"
              className={`w-full !h-11 sm:!h-9 pl-10 pr-3.5 text-sm sm:text-xs bg-slate-50 dark:bg-zinc-900/60 border rounded-xl text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#0C2086]/50 transition-all font-sans ${
                errors.email
                  ? 'border-rose-400 dark:border-rose-600'
                  : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-[11px] text-rose-500 dark:text-rose-400 font-medium">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 font-sans">
              {LoginScreenCON.PASSWORD_LABEL}
            </label>
            <button
              type="button"
              onClick={onNavigateForgotPassword}
              className="text-[11px] font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 cursor-pointer"
            >
              {LoginScreenCON.FORGOT_PASSWORD_LABEL}
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={credentials.password}
              onChange={(e) => onFieldChange('password', e.target.value)}
              placeholder={LoginScreenCON.PASSWORD_PLACEHOLDER}
              autoComplete="current-password"
              className={`w-full !h-11 sm:!h-9 pl-10 pr-10 text-sm sm:text-xs bg-slate-50 dark:bg-zinc-900/60 border rounded-xl text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#0C2086]/50 transition-all font-sans ${
                errors.password
                  ? 'border-rose-400 dark:border-rose-600'
                  : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-[11px] text-rose-500 dark:text-rose-400 font-medium">
              {errors.password}
            </p>
          )}
        </div>

        {/* Remember Me Toggle */}
        <div className="flex items-center gap-2 pt-1">
          <input
            id="rememberMe"
            type="checkbox"
            checked={credentials.rememberMe}
            onChange={(e) => onFieldChange('rememberMe', e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-[#0C2086] focus:ring-[#0C2086]/50 bg-slate-50 dark:bg-zinc-900 cursor-pointer"
          />
          <label htmlFor="rememberMe" className="text-xs text-slate-600 dark:text-zinc-400 cursor-pointer select-none">
            {LoginScreenCON.REMEMBER_ME_LABEL}
          </label>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          <ButtonSharedComponent
            variant="primary"
            size="md"
            type="submit"
            disabled={isLoading || isMicrosoftLoading}
            onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
            className="w-full justify-center !h-11 sm:!h-9 !bg-[#0C2086] hover:!bg-[#081765] !text-white border-none shadow-md font-bold text-sm sm:text-xs rounded-xl cursor-pointer"
            icon={<ArrowRight className="w-4 h-4 !text-white" />}
          >
            <span className="!text-white font-bold">
              {isLoading ? LoginScreenCON.SUBMIT_BUTTON_LOADING : LoginScreenCON.SUBMIT_BUTTON_LABEL}
            </span>
          </ButtonSharedComponent>
        </div>

        {/* Enterprise Note */}
        <div className="text-center pt-2">
          <span className="text-xs text-slate-500 dark:text-zinc-400">
            {LoginScreenCON.DONT_HAVE_ACCOUNT_TEXT}{' '}
          </span>
          <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
            {LoginScreenCON.SIGN_UP_LINK_TEXT}
          </span>
        </div>
      </form>

      {/* Security Footnote */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-400 dark:text-zinc-500">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>{LoginScreenCON.SECURITY_BADGE_TEXT}</span>
      </div>
    </div>
  );
}
