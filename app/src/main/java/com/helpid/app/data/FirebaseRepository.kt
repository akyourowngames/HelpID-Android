package com.helpid.app.data

import android.util.Log
import android.content.Context
import androidx.room.Room
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.gson.Gson
import com.helpid.app.data.local.AppDatabase
import com.helpid.app.data.local.LocalEmergencyContact
import com.helpid.app.data.local.LocalUserProfile
import java.net.HttpURLConnection
import java.net.URL
import java.io.OutputStreamWriter
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.UUID

class FirebaseRepository(context: Context? = null) {
    private val auth = FirebaseAuth.getInstance()
    private val firestore = FirebaseFirestore.getInstance()
    private val localDb = context?.let { AppDatabase.getDatabase(it) }
    private val sharedPrefs = context?.getSharedPreferences("app_settings", Context.MODE_PRIVATE)
    private val gson = Gson()
    private var demoMode = false
    private var currentUserId = ""
    private val lastUserIdKey = "last_user_id"
    private val pendingProfileKey = "pending_profile"
    private val publicKeyKey = "public_profile_key"
    private val webBaseUrlKey = "web_base_url"

    private data class MintResponse(
        val publicKey: String? = null,
        val token: String? = null,
        val url: String? = null
    )

    private fun mapLocalToDomain(local: LocalUserProfile): UserProfile {
        return UserProfile(
            userId = local.userId,
            name = local.name,
            bloodGroup = local.bloodGroup,
            medicalNotes = local.medicalNotes,
            emergencyContacts = local.emergencyContacts.map {
                EmergencyContactData(name = it.name, phone = it.phone)
            },
            language = local.language,
            lastUpdated = local.lastUpdated
        )
    }

    private fun mapDomainToLocal(profile: UserProfile): LocalUserProfile {
        return LocalUserProfile(
            userId = profile.userId,
            name = profile.name,
            bloodGroup = profile.bloodGroup,
            medicalNotes = profile.medicalNotes,
            emergencyContacts = profile.emergencyContacts.map {
                LocalEmergencyContact(name = it.name, phone = it.phone)
            },
            language = profile.language,
            lastUpdated = profile.lastUpdated
        )
    }

    suspend fun initializeUser(): String {
        return try {
            Log.d("FirebaseRepository", "Initializing user...")
            
            // Sign in anonymously if not already signed in
            if (auth.currentUser == null) {
                Log.d("FirebaseRepository", "Attempting anonymous sign in...")
                auth.signInAnonymously().await()
            }
            
            val userId = auth.currentUser?.uid ?: ""
            currentUserId = userId
            Log.d("FirebaseRepository", "User ID: $userId")

            if (userId.isNotEmpty()) {
                sharedPrefs?.edit()?.putString(lastUserIdKey, userId)?.apply()
            }
            
            if (userId.isEmpty()) {
                Log.w("FirebaseRepository", "Failed to get user ID, using demo mode")
                demoMode = true
                currentUserId = "demo-${UUID.randomUUID()}"
                return currentUserId
            }
            
            // Check if user profile exists in Firestore
            try {
                val doc = firestore.collection("users").document(userId).get().await()
                
                if (!doc.exists()) {
                    // Create default profile for new user
                    val defaultProfile = UserProfile.default(userId)
                    firestore.collection("users").document(userId).set(defaultProfile.toMap()).await()
                    Log.d("FirebaseRepository", "Created default profile")
                }
            } catch (firebaseError: Exception) {
                Log.w("FirebaseRepository", "Firestore error, falling back to demo mode: ${firebaseError.message}")
                demoMode = true
            }
            
            userId
        } catch (e: Exception) {
            Log.e("FirebaseRepository", "Auth error: ${e.message}", e)
            val cachedUserId = sharedPrefs?.getString(lastUserIdKey, "").orEmpty()
            if (cachedUserId.isNotEmpty()) {
                Log.d("FirebaseRepository", "Using cached userId for offline mode")
                currentUserId = cachedUserId
                return cachedUserId
            }
            // Fallback to demo mode
            demoMode = true
            currentUserId = "demo-${UUID.randomUUID()}"
            currentUserId
        }
    }

    suspend fun getCachedUserProfile(userId: String): UserProfile? {
        if (localDb == null || userId.isEmpty()) return null
        return try {
            localDb.userProfileDao().getUserProfile(userId)?.let { mapLocalToDomain(it) }
        } catch (e: Exception) {
            Log.e("FirebaseRepository", "Error reading local db: ${e.message}")
            null
        }
    }

    private suspend fun fetchRemoteProfile(userId: String): UserProfile? {
        if (demoMode) return null
        Log.d("FirebaseRepository", "Fetching profile from Firebase for user: $userId")
        val doc = firestore.collection("users").document(userId).get().await()
        if (!doc.exists()) return null

        val profile = UserProfile(
            userId = doc.getString("userId") ?: userId,
            name = doc.getString("name") ?: "",
            bloodGroup = doc.getString("bloodGroup") ?: "",
            medicalNotes = (doc.get("medicalNotes") as? List<*>)?.mapNotNull { it as? String } ?: emptyList(),
            emergencyContacts = (doc.get("emergencyContacts") as? List<*>)?.mapNotNull { contact ->
                if (contact is Map<*, *>) {
                    EmergencyContactData(
                        name = contact["name"] as? String ?: "",
                        phone = contact["phone"] as? String ?: ""
                    )
                } else null
            } ?: emptyList(),
            language = doc.getString("language") ?: "en",
            lastUpdated = doc.getLong("lastUpdated") ?: System.currentTimeMillis()
        )

        if (localDb != null) {
            try {
                localDb.userProfileDao().insertUserProfile(mapDomainToLocal(profile))
                Log.d("FirebaseRepository", "Cached profile to local DB")
            } catch (e: Exception) {
                Log.e("FirebaseRepository", "Failed to cache to local DB: ${e.message}")
            }
        }

        return profile
    }

    private fun cachePendingProfile(profile: UserProfile) {
        sharedPrefs?.edit()?.putString(pendingProfileKey, gson.toJson(profile))?.apply()
    }

    private fun clearPendingProfile() {
        sharedPrefs?.edit()?.remove(pendingProfileKey)?.apply()
    }

    private fun getPendingProfile(): UserProfile? {
        val raw = sharedPrefs?.getString(pendingProfileKey, null) ?: return null
        return try {
            gson.fromJson(raw, UserProfile::class.java)
        } catch (e: Exception) {
            Log.e("FirebaseRepository", "Failed to parse pending profile: ${e.message}")
            null
        }
    }

    suspend fun syncPendingProfile(userId: String): Boolean {
        val pending = getPendingProfile() ?: return false
        if (pending.userId.isEmpty() || pending.userId != userId) return false
        if (demoMode) return false
        return try {
            firestore.collection("users").document(userId).set(pending.toMap()).await()
            clearPendingProfile()
            true
        } catch (e: Exception) {
            Log.e("FirebaseRepository", "Pending profile sync failed: ${e.message}")
            false
        }
    }

    suspend fun getUserProfile(userId: String): UserProfile {
        // 1. Try local cache first
        val cachedProfile = getCachedUserProfile(userId)
        if (cachedProfile != null) {
            Log.d("FirebaseRepository", "Found local profile for user: $userId")
        }

        // 2. Try to fetch from Firebase
        return try {
            val remoteProfile = fetchRemoteProfile(userId)
            remoteProfile ?: cachedProfile ?: UserProfile.default(userId)
        } catch (e: Exception) {
            Log.e("FirebaseRepository", "Error getting profile: ${e.message}", e)
            cachedProfile ?: UserProfile.default(userId)
        }
    }

    suspend fun updateUserProfile(userId: String, profile: UserProfile): Boolean {
        val updatedProfile = profile.copy(
            userId = userId,
            lastUpdated = System.currentTimeMillis()
        )

        // Always update local cache first
        if (localDb != null) {
            try {
                localDb.userProfileDao().insertUserProfile(mapDomainToLocal(updatedProfile))
                Log.d("FirebaseRepository", "Updated local profile")
            } catch (e: Exception) {
                Log.e("FirebaseRepository", "Failed to update local profile: ${e.message}")
            }
        }

        if (demoMode) {
            cachePendingProfile(updatedProfile)
            return true
        }

        return try {
            Log.d("FirebaseRepository", "Updating profile for user: $userId")
            firestore.collection("users").document(userId).set(updatedProfile.toMap()).await()
            clearPendingProfile()
            Log.d("FirebaseRepository", "Profile updated successfully")
            true
        } catch (e: Exception) {
            Log.e("FirebaseRepository", "Error updating profile: ${e.message}", e)
            cachePendingProfile(updatedProfile)
            true
        }
    }

    fun getCurrentUserId(): String {
        return currentUserId.ifEmpty { auth.currentUser?.uid ?: "" }
    }

    fun getEmergencyLink(userId: String): String {
        return "https://helper-id.vercel.app/e/$userId"
    }

    suspend fun mintEmergencyLink(): String {
        if (demoMode) return ""

        val user = auth.currentUser ?: return ""
        val idToken = try {
            user.getIdToken(true).await().token.orEmpty()
        } catch (e: Exception) {
            Log.e("FirebaseRepository", "Failed to get ID token: ${e.message}")
            ""
        }

        if (idToken.isEmpty()) return ""

        val baseUrl = sharedPrefs?.getString(webBaseUrlKey, null)?.takeIf { it.isNotBlank() }
            ?: "https://helper-id.vercel.app"

        val cachedPublicKey = sharedPrefs?.getString(publicKeyKey, "").orEmpty().trim()

        return withContext(Dispatchers.IO) {
            try {
                val url = URL("$baseUrl/api/mint")
                val conn = (url.openConnection() as HttpURLConnection).apply {
                    requestMethod = "POST"
                    connectTimeout = 15000
                    readTimeout = 15000
                    doOutput = true
                    setRequestProperty("Content-Type", "application/json")
                    setRequestProperty("Authorization", "Bearer $idToken")
                }

                val body = if (cachedPublicKey.isNotEmpty()) {
                    "{\"publicKey\":\"$cachedPublicKey\"}"
                } else {
                    "{}"
                }

                OutputStreamWriter(conn.outputStream).use { it.write(body) }

                val code = conn.responseCode
                val stream = if (code in 200..299) conn.inputStream else conn.errorStream
                val raw = stream?.bufferedReader()?.use { it.readText() }.orEmpty()
                if (code !in 200..299) {
                    Log.e("FirebaseRepository", "Mint failed: HTTP $code $raw")
                    return@withContext ""
                }

                val parsed = try {
                    gson.fromJson(raw, MintResponse::class.java)
                } catch (e: Exception) {
                    Log.e("FirebaseRepository", "Mint parse failed: ${e.message}")
                    null
                }

                val pk = parsed?.publicKey.orEmpty()
                if (pk.isNotEmpty()) {
                    sharedPrefs?.edit()?.putString(publicKeyKey, pk)?.apply()
                }

                parsed?.url.orEmpty()
            } catch (e: Exception) {
                Log.e("FirebaseRepository", "Mint link error: ${e.message}")
                ""
            }
        }
    }

    fun isDemoMode(): Boolean = demoMode
}
