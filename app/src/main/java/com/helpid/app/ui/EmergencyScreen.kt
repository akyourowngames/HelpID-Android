package com.helpid.app.ui

import android.Manifest
import android.content.pm.PackageManager
import android.content.Intent
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.net.Uri
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.foundation.BorderStroke
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Call
import androidx.compose.material.icons.outlined.ContentCopy
import androidx.compose.material.icons.outlined.Language
import androidx.compose.material.icons.outlined.Message
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.helpid.app.R
import com.helpid.app.data.FirebaseRepository
import com.helpid.app.data.UserProfile
import com.helpid.app.ui.theme.HelpIDTheme
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import com.helpid.app.ui.components.ShimmerPlaceholder
import com.helpid.app.ui.components.SkeletonSpacer
import com.helpid.app.ui.components.SkeletonTextLine
import androidx.core.content.ContextCompat
import kotlinx.coroutines.withTimeout

data class EmergencyContact(
    val name: String,
    val phoneNumber: String
)

@Composable
fun EmergencyScreen(
    userId: String,
    onLanguageClick: () -> Unit = {}
) {
    val context = LocalContext.current
    val repository = remember { FirebaseRepository(context) }
    val clipboardManager = LocalClipboardManager.current
    
    val userProfile = remember { mutableStateOf(UserProfile.default(userId)) }
    val isLoading = remember { mutableStateOf(true) }
    val isSendingSos = remember { mutableStateOf(false) }
    val isOnline = remember { mutableStateOf(true) }
    val syncTick = remember { mutableStateOf(0) }

    fun launchDial(number: String) {
        val intent = Intent(Intent.ACTION_DIAL).apply {
            data = Uri.parse("tel:${number.replace(" ", "")}")
        }
        try {
            context.startActivity(intent)
        } catch (_: Exception) {
        }
    }

    fun launchSms(number: String) {
        val intent = Intent(Intent.ACTION_SENDTO).apply {
            data = Uri.parse("smsto:${number.replace(" ", "")}")
        }
        try {
            context.startActivity(intent)
        } catch (_: Exception) {
        }
    }

    fun copyNumber(number: String) {
        clipboardManager.setText(AnnotatedString(number))
        Toast.makeText(context, "Number copied", Toast.LENGTH_SHORT).show()
    }

    fun sendSos() {
        if (isSendingSos.value) return
        isSendingSos.value = true

        val vibrator = context.getSystemService(android.content.Context.VIBRATOR_SERVICE) as? Vibrator
        if (vibrator != null) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createOneShot(500, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                vibrator.vibrate(500)
            }
        }

        val hasSms = ContextCompat.checkSelfPermission(context, Manifest.permission.SEND_SMS) == PackageManager.PERMISSION_GRANTED
        val hasFine = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        val hasCoarse = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
        if (!hasSms || (!hasFine && !hasCoarse)) {
            isSendingSos.value = false
            return
        }

        Toast.makeText(context, "SOS triggered", Toast.LENGTH_SHORT).show()
        isSendingSos.value = false
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions(),
        onResult = { result ->
            val sms = result[Manifest.permission.SEND_SMS] == true
            val fine = result[Manifest.permission.ACCESS_FINE_LOCATION] == true
            val coarse = result[Manifest.permission.ACCESS_COARSE_LOCATION] == true
            if (sms && (fine || coarse)) {
                sendSos()
            }
        }
    )

    DisposableEffect(Unit) {
        val connectivityManager = context.getSystemService(ConnectivityManager::class.java)
        if (connectivityManager != null) {
            val callback = object : ConnectivityManager.NetworkCallback() {
                override fun onAvailable(network: Network) {
                    isOnline.value = true
                    syncTick.value += 1
                }

                override fun onLost(network: Network) {
                    isOnline.value = false
                }
            }
            val request = NetworkRequest.Builder()
                .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                .build()
            connectivityManager.registerNetworkCallback(request, callback)

            onDispose {
                connectivityManager.unregisterNetworkCallback(callback)
            }
        } else {
            onDispose { }
        }
    }
    
    // Load profile offline-first: show cached immediately, then sync remote
    LaunchedEffect(userId) {
        android.util.Log.d("EmergencyScreen", "LaunchedEffect started with userId=$userId")
        var hasCached = false
        try {
            if (userId.isNotEmpty()) {
                val cachedProfile = withContext(Dispatchers.IO) {
                    repository.getCachedUserProfile(userId)
                }
                if (cachedProfile != null) {
                    hasCached = true
                    userProfile.value = cachedProfile
                    isLoading.value = false
                }

                withContext(Dispatchers.IO) {
                    try {
                        android.util.Log.d("EmergencyScreen", "Fetching profile from Firebase")
                        // Also add timeout to profile loading
                        withTimeout(5000L) {  // 5 second timeout
                            val profile = repository.getUserProfile(userId)
                            android.util.Log.d("EmergencyScreen", "Profile loaded: ${profile.name}")
                            userProfile.value = profile
                        }
                    } catch (e: Exception) {
                        android.util.Log.e("EmergencyScreen", "Error loading profile: ${e.message}", e)
                        if (!hasCached) {
                            userProfile.value = UserProfile.default(userId)
                        }
                    }
                }
            } else {
                android.util.Log.d("EmergencyScreen", "UserId is empty, using default")
                userProfile.value = UserProfile.default("")
            }
        } catch (e: Exception) {
            android.util.Log.e("EmergencyScreen", "Exception in LaunchedEffect: ${e.message}", e)
        } finally {
            if (!hasCached) {
                isLoading.value = false
            }
            android.util.Log.d("EmergencyScreen", "LaunchedEffect finished, isLoading=${isLoading.value}")
        }
    }

    LaunchedEffect(syncTick.value, userId) {
        if (!isOnline.value || userId.isEmpty()) return@LaunchedEffect
        withContext(Dispatchers.IO) {
            try {
                repository.syncPendingProfile(userId)
                withTimeout(5000L) {
                    val profile = repository.getUserProfile(userId)
                    userProfile.value = profile
                }
            } catch (e: Exception) {
                android.util.Log.e("EmergencyScreen", "Background sync failed: ${e.message}", e)
            }
        }
    }
    
    android.util.Log.d("EmergencyScreen", "About to render: isLoading=${isLoading.value}")
    
    if (isLoading.value) {
        EmergencySkeleton()
        return
    }

    val profile = userProfile.value
    
    // Fallback to demo profile if loading failed (profile should always be set now)
    if (profile.userId.isEmpty()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFFAFAFA)),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("Error loading profile. Using demo data.", fontSize = 14.sp, color = Color(0xFFD32F2F))
        }
        return
    }
    
    val emergencyContacts = profile.emergencyContacts.map {
        EmergencyContact(it.name, it.phone)
    }
    
    val medicalNotes = profile.medicalNotes
    
    // Format last updated
    val lastUpdatedText = remember(profile.lastUpdated) {
        val date = Date(profile.lastUpdated)
        val sdf = SimpleDateFormat("MMM d, yyyy", Locale.getDefault())
        context.getString(R.string.updated, sdf.format(date))
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.Top,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Header with Language Button
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.inverseSurface)
                .padding(horizontal = 16.dp, vertical = 14.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
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
                Spacer(modifier = Modifier.height(8.dp))
                Box(
                    modifier = Modifier
                        .background(
                            if (isOnline.value) Color.White.copy(alpha = 0.16f) else Color(0xFFEF5350).copy(alpha = 0.2f),
                            RoundedCornerShape(20.dp)
                        )
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = if (isOnline.value) "Online sync" else "Offline mode",
                        fontSize = 10.sp,
                        color = Color.White.copy(alpha = 0.9f),
                        letterSpacing = 0.3.sp
                    )
                }
            }

            IconButton(
                onClick = onLanguageClick,
                modifier = Modifier
                    .align(Alignment.CenterEnd)
                    .size(40.dp)
                    .background(Color.Transparent, RoundedCornerShape(10.dp))
            ) {
                Icon(
                    imageVector = Icons.Outlined.Language,
                    contentDescription = "Language",
                    tint = Color.White
                )
            }
        }

        // Personal Information Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp)
                .shadow(elevation = 3.dp, shape = RoundedCornerShape(16.dp)),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface
            ),
            elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
            border = BorderStroke(
                width = 1.dp,
                brush = Brush.linearGradient(
                    colors = listOf(
                        MaterialTheme.colorScheme.primary.copy(alpha = 0.3f),
                        MaterialTheme.colorScheme.tertiary.copy(alpha = 0.25f)
                    )
                )
            )
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
                    .animateContentSize(),
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
                            text = stringResource(R.string.full_name),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            letterSpacing = 0.3.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = profile.name,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Light,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                    Box(
                        modifier = Modifier
                            .background(MaterialTheme.colorScheme.primary, RoundedCornerShape(6.dp))
                            .padding(horizontal = 10.dp, vertical = 6.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = profile.bloodGroup,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onPrimary
                        )
                    }
                }

                // Medical Conditions
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                            RoundedCornerShape(12.dp)
                        )
                        .padding(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = stringResource(R.string.medical_conditions),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            letterSpacing = 0.4.sp
                        )
                        Box(
                            modifier = Modifier
                                .background(
                                    Brush.horizontalGradient(
                                        colors = listOf(
                                            MaterialTheme.colorScheme.primary.copy(alpha = 0.15f),
                                            MaterialTheme.colorScheme.secondary.copy(alpha = 0.12f)
                                        )
                                    ),
                                    RoundedCornerShape(20.dp)
                                )
                                .padding(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = "INFO",
                                fontSize = 9.sp,
                                letterSpacing = 1.sp,
                                color = MaterialTheme.colorScheme.primary,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                    Column(
                        modifier = Modifier.padding(top = 10.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        medicalNotes.forEach { note ->
                            val isPressed = remember { mutableStateOf(false) }
                            val dotSize by animateDpAsState(
                                targetValue = if (isPressed.value) 7.dp else 5.dp,
                                label = "medicalDot"
                            )
                            val dotColor by animateColorAsState(
                                targetValue = if (isPressed.value) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.secondary,
                                label = "medicalDotColor"
                            )
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .graphicsLayer(alpha = if (isPressed.value) 0.9f else 1f)
                                    .clickable(
                                        interactionSource = remember { MutableInteractionSource() },
                                        indication = null
                                    ) {
                                        isPressed.value = !isPressed.value
                                    }
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(dotSize)
                                        .background(dotColor, RoundedCornerShape(3.dp))
                                )
                                Spacer(modifier = Modifier.width(10.dp))
                                Text(
                                    text = note,
                                    fontSize = 13.sp,
                                    color = MaterialTheme.colorScheme.onSurface,
                                    lineHeight = 18.sp
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
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
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
                containerColor = MaterialTheme.colorScheme.surface
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
                    text = stringResource(R.string.emergency_contacts),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
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
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                IconButton(onClick = { launchDial(contact.phoneNumber) }) {
                                    Icon(
                                        imageVector = Icons.Outlined.Call,
                                        contentDescription = "Call",
                                        tint = MaterialTheme.colorScheme.primary
                                    )
                                }
                                IconButton(onClick = { launchSms(contact.phoneNumber) }) {
                                    Icon(
                                        imageVector = Icons.Outlined.Message,
                                        contentDescription = "SMS",
                                        tint = MaterialTheme.colorScheme.secondary
                                    )
                                }
                                IconButton(onClick = { copyNumber(contact.phoneNumber) }) {
                                    Icon(
                                        imageVector = Icons.Outlined.ContentCopy,
                                        contentDescription = "Copy",
                                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
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
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // SOS Button - Large Red Button
            // Primary: Emergency Call
            Button(
                onClick = {
                    val intent = Intent(Intent.ACTION_DIAL).apply {
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
                    containerColor = MaterialTheme.colorScheme.primary
                )
            ) {
                Text(
                    text = stringResource(R.string.call_emergency),
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 15.sp,
                    letterSpacing = 0.5.sp
                )
            }

            // SOS Button
            Button(
                onClick = { 
                    permissionLauncher.launch(
                        arrayOf(
                            Manifest.permission.SEND_SMS,
                            Manifest.permission.ACCESS_FINE_LOCATION,
                            Manifest.permission.ACCESS_COARSE_LOCATION
                        )
                    )
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.error
                ),
                enabled = !isSendingSos.value
            ) {
                Text(
                    text = if (isSendingSos.value) "SENDING SOS..." else "🚨 SEND SOS 🚨",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    letterSpacing = 0.5.sp,
                    color = MaterialTheme.colorScheme.onError
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

@Composable
private fun EmergencySkeleton() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.Top,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.inverseSurface)
                .padding(horizontal = 20.dp, vertical = 24.dp)
        ) {
            SkeletonTextLine(widthFraction = 0.5f, height = 22.dp)
            SkeletonSpacer(8.dp)
            SkeletonTextLine(widthFraction = 0.65f, height = 12.dp)
        }

        Spacer(modifier = Modifier.height(16.dp))

        SkeletonCard(height = 164.dp)
        SkeletonCard(height = 196.dp)

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            ShimmerPlaceholder(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
            )
            ShimmerPlaceholder(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
            )
            ShimmerPlaceholder(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
            )
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
private fun SkeletonCard(height: androidx.compose.ui.unit.Dp) {
    ShimmerPlaceholder(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp)
            .height(height),
        cornerRadius = 12.dp
    )
}
