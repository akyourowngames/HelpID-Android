package com.helpid.app.data

import android.util.Log
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await
import java.util.UUID

class FirebaseRepository {
    private val auth = FirebaseAuth.getInstance()
    private val firestore = FirebaseFirestore.getInstance()
    private var demoMode = false
    private var currentUserId = ""

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
            // Fallback to demo mode
            demoMode = true
            currentUserId = "demo-${UUID.randomUUID()}"
            currentUserId
        }
    }

    suspend fun getUserProfile(userId: String): UserProfile {
        return try {
            if (demoMode) {
                Log.d("FirebaseRepository", "Demo mode: returning demo profile")
                return UserProfile(
                    userId = userId,
                    name = "Demo User",
                    bloodGroup = "O+",
                    medicalNotes = listOf("Allergic to penicillin", "Diabetic"),
                    emergencyContacts = listOf(
                        EmergencyContactData("Mom", "+1234567890"),
                        EmergencyContactData("Dad", "+0987654321")
                    ),
                    language = "en",
                    lastUpdated = System.currentTimeMillis()
                )
            }
            
            Log.d("FirebaseRepository", "Fetching profile for user: $userId")
            val doc = firestore.collection("users").document(userId).get().await()
            
            if (doc.exists()) {
                UserProfile(
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
            } else {
                UserProfile.default(userId)
            }
        } catch (e: Exception) {
            Log.e("FirebaseRepository", "Error getting profile: ${e.message}", e)
            // Return demo profile on error
            UserProfile(
                userId = userId,
                name = "Demo User",
                bloodGroup = "O+",
                medicalNotes = listOf("Allergic to penicillin", "Diabetic"),
                emergencyContacts = listOf(
                    EmergencyContactData("Mom", "+1234567890"),
                    EmergencyContactData("Dad", "+0987654321")
                ),
                language = "en",
                lastUpdated = System.currentTimeMillis()
            )
        }
    }

    suspend fun updateUserProfile(userId: String, profile: UserProfile): Boolean {
        return try {
            if (demoMode) {
                Log.d("FirebaseRepository", "Demo mode: profile update simulated")
                return true
            }
            
            Log.d("FirebaseRepository", "Updating profile for user: $userId")
            val updatedProfile = profile.copy(
                userId = userId,
                lastUpdated = System.currentTimeMillis()
            )
            firestore.collection("users").document(userId).set(updatedProfile.toMap()).await()
            Log.d("FirebaseRepository", "Profile updated successfully")
            true
        } catch (e: Exception) {
            Log.e("FirebaseRepository", "Error updating profile: ${e.message}", e)
            // In demo mode, just return true
            if (demoMode) true else false
        }
    }

    fun getCurrentUserId(): String {
        return currentUserId.ifEmpty { auth.currentUser?.uid ?: "" }
    }

    fun getEmergencyLink(userId: String): String {
        return "https://helpid.app/e/$userId"
    }

    fun isDemoMode(): Boolean = demoMode
}
