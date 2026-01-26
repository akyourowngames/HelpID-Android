package com.helpid.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.helpid.app.R
import com.helpid.app.data.EmergencyContactData
import com.helpid.app.data.FirebaseRepository
import com.helpid.app.data.UserProfile
import com.helpid.app.ui.theme.HelpIDTheme
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@Composable
fun EditProfileScreen(
    userId: String,
    onBackClick: () -> Unit = {},
    onSaveSuccess: () -> Unit = {}
) {
    val repository = remember { FirebaseRepository() }
    val scope = rememberCoroutineScope()
    
    val profile = remember { mutableStateOf<UserProfile?>(null) }
    val isLoading = remember { mutableStateOf(true) }
    val isSaving = remember { mutableStateOf(false) }
    
    val name = remember { mutableStateOf("") }
    val bloodGroup = remember { mutableStateOf("") }
    val medicalNotes = remember { mutableStateOf("") }
    val emergencyContact1Name = remember { mutableStateOf("") }
    val emergencyContact1Phone = remember { mutableStateOf("") }
    val emergencyContact2Name = remember { mutableStateOf("") }
    val emergencyContact2Phone = remember { mutableStateOf("") }

    // Load profile on first launch
    LaunchedEffect(userId) {
        withContext(Dispatchers.IO) {
            val loadedProfile = repository.getUserProfile(userId)
            profile.value = loadedProfile
            
            // Populate fields
            name.value = loadedProfile.name
            bloodGroup.value = loadedProfile.bloodGroup
            medicalNotes.value = loadedProfile.medicalNotes.joinToString("\n")
            
            if (loadedProfile.emergencyContacts.isNotEmpty()) {
                emergencyContact1Name.value = loadedProfile.emergencyContacts[0].name
                emergencyContact1Phone.value = loadedProfile.emergencyContacts[0].phone
            }
            if (loadedProfile.emergencyContacts.size > 1) {
                emergencyContact2Name.value = loadedProfile.emergencyContacts[1].name
                emergencyContact2Phone.value = loadedProfile.emergencyContacts[1].phone
            }
            
            isLoading.value = false
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFFAFAFA))
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.Top,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Header
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF1A1A1A))
                .padding(20.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = stringResource(R.string.edit_profile),
                fontSize = 22.sp,
                fontWeight = FontWeight.Light,
                color = Color.White,
                textAlign = TextAlign.Center,
                letterSpacing = 0.5.sp
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = stringResource(R.string.update_emergency_information),
                fontSize = 12.sp,
                color = Color.White.copy(alpha = 0.6f),
                textAlign = TextAlign.Center,
                letterSpacing = 0.3.sp
            )
        }

        if (!isLoading.value) {
            Spacer(modifier = Modifier.height(16.dp))

            // Form Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .shadow(elevation = 1.dp, shape = RoundedCornerShape(8.dp)),
                shape = RoundedCornerShape(8.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // Name Field
                    FormField(stringResource(R.string.full_name), name.value) { name.value = it }
                    FormField(stringResource(R.string.blood_group), bloodGroup.value) { bloodGroup.value = it }

                    // Medical Notes
                    Text(
                        text = stringResource(R.string.medical_conditions),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF999999),
                        letterSpacing = 0.3.sp
                    )
                    TextField(
                        value = medicalNotes.value,
                        onValueChange = { medicalNotes.value = it },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(100.dp),
                        placeholder = { Text(stringResource(R.string.one_per_line)) },
                        colors = TextFieldDefaults.colors(
                            unfocusedContainerColor = Color(0xFFF5F5F5),
                            focusedContainerColor = Color.White,
                            unfocusedIndicatorColor = Color.Transparent,
                            focusedIndicatorColor = Color(0xFFD32F2F)
                        ),
                        shape = RoundedCornerShape(8.dp)
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    // Emergency Contacts
                    Text(
                        text = stringResource(R.string.emergency_contact_1),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF999999),
                        letterSpacing = 0.3.sp
                    )
                    FormField(stringResource(R.string.full_name), emergencyContact1Name.value) { emergencyContact1Name.value = it }
                    FormField(stringResource(R.string.phone), emergencyContact1Phone.value) { emergencyContact1Phone.value = it }

                    Text(
                        text = stringResource(R.string.emergency_contact_2),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF999999),
                        letterSpacing = 0.3.sp,
                        modifier = Modifier.padding(top = 8.dp)
                    )
                    FormField(stringResource(R.string.full_name), emergencyContact2Name.value) { emergencyContact2Name.value = it }
                    FormField(stringResource(R.string.phone), emergencyContact2Phone.value) { emergencyContact2Phone.value = it }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Action Buttons
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Save Button
                Button(
                    onClick = {
                        isSaving.value = true
                        val updatedProfile = UserProfile(
                            userId = userId,
                            name = name.value,
                            bloodGroup = bloodGroup.value,
                            medicalNotes = medicalNotes.value.split("\n").filter { it.isNotBlank() },
                            emergencyContacts = listOf(
                                EmergencyContactData(emergencyContact1Name.value, emergencyContact1Phone.value),
                                EmergencyContactData(emergencyContact2Name.value, emergencyContact2Phone.value)
                            ).filter { it.name.isNotBlank() && it.phone.isNotBlank() },
                            language = "en"
                        )

                        // Save to Firebase in coroutine
                        scope.launch {
                            withContext(Dispatchers.IO) {
                                val success = repository.updateUserProfile(userId, updatedProfile)
                                isSaving.value = false
                                if (success) {
                                    onSaveSuccess()
                                    onBackClick()
                                }
                            }
                        }
                    },
                    enabled = !isSaving.value,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFFD32F2F),
                        disabledContainerColor = Color(0xFFD32F2F).copy(alpha = 0.5f)
                    )
                ) {
                    Text(
                        text = if (isSaving.value) "SAVING..." else stringResource(R.string.save),
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 14.sp,
                        letterSpacing = 0.5.sp
                    )
                }

                // Cancel Button
                Button(
                    onClick = onBackClick,
                    enabled = !isSaving.value,
                    modifier = Modifier
                        .fillMaxWidth(0.7f)
                        .height(40.dp)
                        .align(Alignment.CenterHorizontally),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color.Transparent
                    )
                ) {
                    Text(
                        text = stringResource(R.string.cancel),
                        fontWeight = FontWeight.Light,
                        fontSize = 12.sp,
                        color = Color(0xFF999999)
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))
        } else {
            // Loading state
            Spacer(modifier = Modifier.height(40.dp))
            Text(
                text = "Loading profile...",
                fontSize = 14.sp,
                color = Color(0xFF999999)
            )
        }
    }
}

@Composable
private fun FormField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit
) {
    Column {
        Text(
            text = label,
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium,
            color = Color(0xFF999999),
            letterSpacing = 0.3.sp
        )
        Spacer(modifier = Modifier.height(6.dp))
        TextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth(),
            colors = TextFieldDefaults.colors(
                unfocusedContainerColor = Color(0xFFF5F5F5),
                focusedContainerColor = Color.White,
                unfocusedIndicatorColor = Color.Transparent,
                focusedIndicatorColor = Color(0xFFD32F2F)
            ),
            shape = RoundedCornerShape(8.dp),
            singleLine = true,
            textStyle = androidx.compose.ui.text.TextStyle(fontSize = 14.sp)
        )
    }
}
