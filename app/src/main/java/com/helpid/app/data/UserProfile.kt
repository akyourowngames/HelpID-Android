package com.helpid.app.data

import java.util.Date

data class EmergencyContactData(
    val name: String = "",
    val phone: String = ""
)

data class MedicationData(
    val name: String = "",
    val dosage: String = "",
    val frequency: String = ""
)

data class AllergyData(
    val allergen: String = "",
    val severity: String = "", // Mild, Moderate, Severe
    val reaction: String = ""
)

data class UserProfile(
    val userId: String = "",
    val name: String = "",
    val bloodGroup: String = "",
    val medicalNotes: List<String> = emptyList(),
    val allergies: List<AllergyData> = emptyList(),
    val medications: List<MedicationData> = emptyList(),
    val emergencyContacts: List<EmergencyContactData> = emptyList(),
    val language: String = "en",
    val lastUpdated: Long = System.currentTimeMillis()
) {
    // Convenience method to convert to Firestore format
    fun toMap(): Map<String, Any> = mapOf(
        "userId" to userId,
        "name" to name,
        "bloodGroup" to bloodGroup,
        "medicalNotes" to medicalNotes,
        "allergies" to allergies.map { 
            mapOf(
                "allergen" to it.allergen,
                "severity" to it.severity,
                "reaction" to it.reaction
            )
        },
        "medications" to medications.map {
            mapOf(
                "name" to it.name,
                "dosage" to it.dosage,
                "frequency" to it.frequency
            )
        },
        "emergencyContacts" to emergencyContacts.map { 
            mapOf(
                "name" to it.name,
                "phone" to it.phone
            )
        },
        "language" to language,
        "lastUpdated" to lastUpdated
    )

    companion object {
        // Default profile for new users
        fun default(userId: String = ""): UserProfile = UserProfile(
            userId = userId,
            name = "John Doe",
            bloodGroup = "O+",
            medicalNotes = listOf(
                "Diabetic",
                "High Blood Pressure"
            ),
            allergies = listOf(
                AllergyData("Penicillin", "Severe", "Anaphylaxis risk"),
                AllergyData("Peanuts", "Moderate", "Hives and throat swelling")
            ),
            medications = listOf(
                MedicationData("Aspirin", "100mg", "Daily"),
                MedicationData("Metformin", "500mg", "Twice daily")
            ),
            emergencyContacts = listOf(
                EmergencyContactData("Father", "+91 98765 43210"),
                EmergencyContactData("Mother", "+91 87654 32109")
            ),
            language = "en"
        )
    }
}
