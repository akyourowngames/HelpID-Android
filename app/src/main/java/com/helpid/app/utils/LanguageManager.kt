package com.helpid.app.utils

import android.content.Context
import android.content.res.Configuration
import java.util.Locale

object LanguageManager {
    private const val LANGUAGE_PREF = "selected_language"
    
    enum class Language(val code: String, val displayName: String) {
        ENGLISH("en", "English"),
        SPANISH("es", "Español"),
        HINDI("hi", "हिंदी"),
        FRENCH("fr", "Français"),
        GERMAN("de", "Deutsch")
    }
    
    fun setLanguage(context: Context, language: Language) {
        val sharedPref = context.getSharedPreferences("app_settings", Context.MODE_PRIVATE)
        sharedPref.edit().putString(LANGUAGE_PREF, language.code).apply()
        
        val locale = Locale(language.code)
        Locale.setDefault(locale)
        
        val config = Configuration()
        config.locale = locale
        context.resources.updateConfiguration(config, context.resources.displayMetrics)
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
}
