package com.helpid.app.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverters

@Entity(tableName = "user_profile")
data class LocalUserProfile(
    @PrimaryKey val userId: String,
    val name: String,
    val bloodGroup: String,
    val address: String,
    val allergies: List<String>,
    val medicalNotes: List<String>,
    val emergencyContacts: List<LocalEmergencyContact>,
    val language: String,
    val lastUpdated: Long
)

data class LocalEmergencyContact(
    val name: String,
    val phone: String
)
