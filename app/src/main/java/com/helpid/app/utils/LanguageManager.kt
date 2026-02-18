package com.helpid.app.utils

import android.content.Context
import android.content.res.Configuration
import android.os.Build
import android.os.LocaleList
import java.util.Locale

object LanguageManager {
    private const val LANGUAGE_PREF = "selected_language"
    
    enum class Language(val code: String, val displayName: String) {
        ENGLISH("en", "English"),
        SPANISH("es", "Espanol"),
        HINDI("hi", "Hindi"),
        FRENCH("fr", "Francais"),
        GERMAN("de", "Deutsch")
    }
    
    fun setLanguage(context: Context, language: Language) {
        val sharedPref = context.getSharedPreferences("app_settings", Context.MODE_PRIVATE)
        sharedPref.edit().putString(LANGUAGE_PREF, language.code).apply()
        applyLocaleToRuntime(language.code)
        updateResources(context, language.code)
    }

    fun applySavedLanguage(context: Context): Context {
        val selected = getSelectedLanguage(context)
        applyLocaleToRuntime(selected.code)
        return updateResources(context, selected.code)
    }
    
    fun getSelectedLanguage(context: Context): Language {
        val sharedPref = context.getSharedPreferences("app_settings", Context.MODE_PRIVATE)
        val languageCode = sharedPref.getString(LANGUAGE_PREF, "en") ?: "en"
        return Language.values().firstOrNull { it.code == languageCode } ?: Language.ENGLISH
    }
    
    fun getCurrentLocale(): Locale {
        return Locale.getDefault()
    }
    
    fun getAvailableLanguages(): List<Language> {
        return Language.values().toList()
    }

    private fun applyLocaleToRuntime(languageCode: String) {
        val locale = Locale(languageCode)
        Locale.setDefault(locale)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            LocaleList.setDefault(LocaleList(locale))
        }
    }

    private fun updateResources(context: Context, languageCode: String): Context {
        val locale = Locale(languageCode)
        val configuration = Configuration(context.resources.configuration)
        configuration.setLocale(locale)
        configuration.setLayoutDirection(locale)
        return context.createConfigurationContext(configuration)
    }
}

