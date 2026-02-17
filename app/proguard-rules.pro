# HelpID ProGuard/R8 rules
# Keep rules minimal; expand only if you hit missing-class/runtime issues.

# Kotlin metadata
-keep class kotlin.Metadata { *; }

# Firebase / Google Play Services
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# Gson (if you reflectively parse models)
-keep class com.google.gson.** { *; }
-dontwarn sun.misc.**

# Room
-keep class androidx.room.** { *; }
-dontwarn androidx.room.**

# ZXing
-keep class com.google.zxing.** { *; }
-dontwarn com.google.zxing.**

# iTextG (legacy)
-keep class com.itextpdf.** { *; }
-dontwarn com.itextpdf.**

# Compose usually works without extra rules, but keep composable annotations safe
-dontwarn androidx.compose.**
