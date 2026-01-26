package com.helpid.app.ui

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.helpid.app.data.FirebaseRepository
import com.helpid.app.data.UserProfile
import com.helpid.app.ui.theme.HelpIDTheme
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class EmergencyContact(
    val name: String,
    val phoneNumber: String
)

@Composable
fun EmergencyScreen(
    userId: String,
    onShowQRClick: () -> Unit = {},
    onEditClick: () -> Unit = {},
    onLanguageClick: () -> Unit = {}
) {
    val context = LocalContext.current
    val repository = remember { FirebaseRepository() }
    
    val userProfile = remember { mutableStateOf<UserProfile?>(null) }
    val isLoading = remember { mutableStateOf(true) }
    
    // Load profile from Firebase
    LaunchedEffect(userId) {
        if (userId.isNotEmpty()) {
            withContext(Dispatchers.IO) {
                val profile = repository.getUserProfile(userId)
                userProfile.value = profile
                isLoading.value = false
            }
        }
    }
    
    if (isLoading.value) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFFAFAFA)),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("Loading...", fontSize = 14.sp, color = Color(0xFF999999))
        }
        return
    }

    val profile = userProfile.value ?: return
    
    val emergencyContacts = profile.emergencyContacts.map {
        EmergencyContact(it.name, it.phone)
    }
    
    val medicalNotes = profile.medicalNotes
    
    // Format last updated
    val lastUpdatedText = remember(profile.lastUpdated) {
        val date = Date(profile.lastUpdated)
        val sdf = SimpleDateFormat("MMM d, yyyy", Locale.getDefault())
        "Updated: ${sdf.format(date)}"
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFFAFAFA))
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.Top,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Header with Language Button
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF1A1A1A))
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Emergency ID",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Light,
                    color = Color.White,
                    textAlign = TextAlign.Center,
                    letterSpacing = 0.5.sp
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "For use in medical emergencies",
                    fontSize = 12.sp,
                    color = Color.White.copy(alpha = 0.6f),
                    textAlign = TextAlign.Center,
                    letterSpacing = 0.3.sp
                )
            }
            // Language/Settings Button
            Button(
                onClick = onLanguageClick,
                modifier = Modifier.size(40.dp),
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF333333)
                )
            ) {
                Text(
                    text = "🌐",
                    fontSize = 20.sp
                )
            }
        }

        // Personal Information Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp)
                .shadow(elevation = 1.dp, shape = RoundedCornerShape(8.dp)),
            shape = RoundedCornerShape(8.dp),
            colors = CardDefaults.cardColors(
                containerColor = Color.White
            ),
            elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Name + Blood Group Badge
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Full Name",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color(0xFF999999),
                            letterSpacing = 0.3.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = profile.name,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Light,
                            color = Color(0xFF1A1A1A)
                        )
                    }
                    Box(
                        modifier = Modifier
                            .background(Color(0xFFD32F2F), RoundedCornerShape(6.dp))
                            .padding(horizontal = 10.dp, vertical = 6.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = profile.bloodGroup,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.White
                        )
                    }
                }

                // Medical Conditions
                Column {
                    Text(
                        text = "Medical Conditions",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF999999),
                        letterSpacing = 0.3.sp
                    )
                    Column(
                        modifier = Modifier.padding(top = 8.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        medicalNotes.forEach { note ->
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(4.dp)
                                        .background(Color(0xFFD32F2F), RoundedCornerShape(2.dp))
                                )
                                Spacer(modifier = Modifier.width(10.dp))
                                Text(
                                    text = note,
                                    fontSize = 13.sp,
                                    color = Color(0xFF4A4A4A),
                                    lineHeight = 16.sp
                                )
                            }
                        }
                    }
                }
                
                // Last Updated
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = lastUpdatedText,
                    fontSize = 10.sp,
                    color = Color(0xFF999999),
                    fontWeight = FontWeight.Light
                )
            }
        }

        // Emergency Contacts Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp)
                .shadow(elevation = 1.dp, shape = RoundedCornerShape(8.dp)),
            shape = RoundedCornerShape(8.dp),
            colors = CardDefaults.cardColors(
                containerColor = Color.White
            ),
            elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = "Emergency Contacts",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF999999),
                    letterSpacing = 0.3.sp
                )

                emergencyContacts.forEach { contact ->
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(
                                Color(0xFFFAFAFA),
                                shape = RoundedCornerShape(8.dp)
                            )
                            .clickable(
                                interactionSource = remember { MutableInteractionSource() },
                                indication = null
                            ) {
                                val intent = Intent(Intent.ACTION_CALL).apply {
                                    data = Uri.parse("tel:${contact.phoneNumber.replace(" ", "")}")
                                }
                                try {
                                    context.startActivity(intent)
                                } catch (e: Exception) {
                                    // Handle case where call permission is not granted
                                }
                            }
                            .padding(12.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(48.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = contact.name,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color(0xFF1A1A1A)
                                )
                                Spacer(modifier = Modifier.height(3.dp))
                                Text(
                                    text = contact.phoneNumber,
                                    fontSize = 12.sp,
                                    color = Color(0xFF666666),
                                    fontWeight = FontWeight.Light
                                )
                            }
                            Text(
                                text = "☎",
                                fontSize = 18.sp,
                                color = Color(0xFFD32F2F)
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Action Buttons
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Primary: Emergency Call
            Button(
                onClick = {
                    val intent = Intent(Intent.ACTION_CALL).apply {
                        data = Uri.parse("tel:112")
                    }
                    try {
                        context.startActivity(intent)
                    } catch (e: Exception) {
                        // Handle case where call permission is not granted
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFFD32F2F)
                )
            ) {
                Text(
                    text = "CALL EMERGENCY • 112",
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 15.sp,
                    letterSpacing = 0.5.sp
                )
            }

            // Secondary: QR Code
            Button(
                onClick = onShowQRClick,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFFF5F5F5)
                )
            ) {
                Text(
                    text = "Show QR Code",
                    fontWeight = FontWeight.Medium,
                    fontSize = 14.sp,
                    color = Color(0xFF1A1A1A)
                )
            }

            // Tertiary: Edit
            Button(
                onClick = onEditClick,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(44.dp),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFFF5F5F5)
                )
            ) {
                Text(
                    text = "Edit Profile",
                    fontWeight = FontWeight.Medium,
                    fontSize = 14.sp,
                    color = Color(0xFF1A1A1A)
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Preview(showBackground = true)
@Composable
fun EmergencyScreenPreview() {
    HelpIDTheme {
        EmergencyScreen(userId = "demo-user-id")
    }
}
