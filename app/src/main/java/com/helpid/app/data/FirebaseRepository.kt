package com.helpid.app.data

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

class FirebaseRepository {
    private val auth = FirebaseAuth.getInstance()
    private val firestore = FirebaseFirestore.getInstance()

    suspend fun initializeUser(): String {
        return try {
            // Sign in anonymously if not already signed in
            if (auth.currentUser == null) {
                auth.signInAnonymously().await()
            }
            
            val userId = auth.currentUser?.uid ?: ""
            
            // Check if user profile exists in Firestore
            val doc = firestore.collection("users").document(userId).get().await()
            
            if (!doc.exists()) {
                // Create default profile for new user
                val defaultProfile = UserProfile.default(userId)
                firestore.collection("users").document(userId).set(defaultProfile.toMap()).await()
            }
            
            userId
        } catch (e: Exception) {
            e.printStackTrace()
            ""
        }
    }

    suspend fun getUserProfile(userId: String): UserProfile {
        return try {
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
            e.printStackTrace()
            UserProfile.default(userId)
        }
    }

    suspend fun updateUserProfile(userId: String, profile: UserProfile): Boolean {
        return try {
            val updatedProfile = profile.copy(
                userId = userId,
                lastUpdated = System.currentTimeMillis()
            )
            firestore.collection("users").document(userId).set(updatedProfile.toMap()).await()
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    fun getCurrentUserId(): String {
        return auth.currentUser?.uid ?: ""
    }

    fun getEmergencyLink(userId: String): String {
        return "https://helpid.app/e/$userId"
    }
}
