package com.helpid.app.ui

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import android.content.Intent
import android.location.Location
import android.nfc.NdefMessage
import android.nfc.NdefRecord
import android.nfc.NfcAdapter
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.net.Uri
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.telephony.SmsManager
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
import com.helpid.app.utils.NotificationHelper
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.Tasks
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.launch
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import com.helpid.app.ui.components.ShimmerPlaceholder
import com.helpid.app.ui.components.SkeletonSpacer
import com.helpid.app.ui.components.SkeletonTextLine
import androidx.core.content.ContextCompat
import kotlinx.coroutines.withTimeout
import androidx.compose.runtime.rememberCoroutineScope

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
    val notificationHelper = remember { NotificationHelper(context) }
    val scope = rememberCoroutineScope()
    val activity = context as? Activity
    val nfcAdapter = remember { NfcAdapter.getDefaultAdapter(context) }
    val isNfcActive = remember { mutableStateOf(false) }
    
    val userProfile = remember { mutableStateOf(UserProfile.default(userId)) }
    val isLoading = remember { mutableStateOf(true) }
    val isSendingSos = remember { mutableStateOf(false) }
    val sosCountdown = remember { mutableStateOf(0) }
    val sosCountdownJob = remember { mutableStateOf<Job?>(null) }
    val isOnline = remember { mutableStateOf(true) }
    val syncTick = remember { mutableStateOf(0) }
    val nfcShareUrl = remember { mutableStateOf("") }

    fun launchDial(number: String) {
        val intent = Intent(Intent.ACTION_DIAL).apply {
            data = Uri.parse("tel:${number.replace(" ", "")}")
        }
        try {
            context.startActivity(intent)
        } catch (_: Exception) {
        }
    }

    fun setBeamMessage(message: NdefMessage?) {
        if (nfcAdapter == null || activity == null) return
        try {
            val method = NfcAdapter::class.java.getMethod(
                "setNdefPushMessage",
                NdefMessage::class.java,
                Activity::class.java
            )
            method.invoke(nfcAdapter, message, activity)
        } catch (_: Exception) {
        }
    }

    DisposableEffect(isNfcActive.value, nfcShareUrl.value) {
        val urlToBeam = nfcShareUrl.value
        if (nfcAdapter == null || activity == null || urlToBeam.isEmpty()) {
            onDispose { }
        } else {
            if (isNfcActive.value) {
                val message = NdefMessage(
                    arrayOf(NdefRecord.createUri(urlToBeam))
                )
                setBeamMessage(message)
            } else {
                setBeamMessage(null)
            }
            onDispose {
                setBeamMessage(null)
            }
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
        Toast.makeText(context, context.getString(R.string.toast_number_copied), Toast.LENGTH_SHORT).show()
    }

    fun hasSosPermissions(): Boolean {
        val hasSms = ContextCompat.checkSelfPermission(context, Manifest.permission.SEND_SMS) == PackageManager.PERMISSION_GRANTED
        val hasFine = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        val hasCoarse = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
        return hasSms && (hasFine || hasCoarse)
    }

    fun sendSos(isTestMode: Boolean = false) {
        if (isSendingSos.value) return
        isSendingSos.value = true

        val contacts = userProfile.value.emergencyContacts
            .map { EmergencyContact(name = it.name, phoneNumber = it.phone) }
            .filter { it.phoneNumber.isNotBlank() }

        if (contacts.isEmpty()) {
            Toast.makeText(context, context.getString(R.string.toast_sos_no_contacts), Toast.LENGTH_SHORT).show()
            notificationHelper.showSosFailed()
            isSendingSos.value = false
            return
        }

        val vibrator = context.getSystemService(android.content.Context.VIBRATOR_SERVICE) as? Vibrator
        if (vibrator != null) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createOneShot(500, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                vibrator.vibrate(500)
            }
        }

        if (!hasSosPermissions()) {
            notificationHelper.showSosFailed()
            isSendingSos.value = false
            return
        }

        scope.launch {
            try {
                val profile = userProfile.value

                val location: Location? = withContext(Dispatchers.IO) {
                    val fused = LocationServices.getFusedLocationProviderClient(context)
                    val hasFinePerm = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
                    val hasCoarsePerm = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
                    if (!hasFinePerm && !hasCoarsePerm) return@withContext null

                    try {
                        withTimeout(3500L) {
                            val last = Tasks.await(fused.lastLocation)
                            if (last != null) return@withTimeout last

                            val current = Tasks.await(
                                fused.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, null)
                            )
                            current
                        }
                    } catch (_: Exception) {
                        null
                    }
                }

                val mapsLink = if (location != null) {
                    "https://maps.google.com/?q=${location.latitude},${location.longitude}"
                } else {
                    ""
                }

                val msg = buildString {
                    append(if (isTestMode) "TEST SOS: Please ignore." else "SOS! I need help.")
                    if (profile.name.isNotBlank()) append("\nName: ${profile.name}")
                    if (profile.bloodGroup.isNotBlank()) append("\nBlood: ${profile.bloodGroup}")
                    if (profile.address.isNotBlank()) append("\nAddress: ${profile.address}")
                    if (mapsLink.isNotBlank()) append("\nLocation: $mapsLink")
                }

                if (isTestMode) {
                    Toast.makeText(context, "Test SOS ready: permissions and message are valid.", Toast.LENGTH_SHORT).show()
                    notificationHelper.showSosDelivered()
                    return@launch
                }

                val smsManager = SmsManager.getDefault()

                var sentAny = false
                contacts.forEach { c ->
                    try {
                        smsManager.sendTextMessage(c.phoneNumber, null, msg, null, null)
                        sentAny = true
                    } catch (_: Exception) {
                        // keep trying other contacts
                    }
                }

                if (sentAny) {
                    Toast.makeText(context, context.getString(R.string.toast_sos_triggered), Toast.LENGTH_SHORT).show()
                    notificationHelper.showSosDelivered()
                } else {
                    Toast.makeText(context, context.getString(R.string.toast_sos_sms_failed), Toast.LENGTH_SHORT).show()
                    notificationHelper.showSosFailed()
                }
            } finally {
                isSendingSos.value = false
            }
        }
    }

    fun cancelSosCountdown() {
        sosCountdownJob.value?.cancel()
        sosCountdownJob.value = null
        sosCountdown.value = 0
    }

    fun startSosCountdown() {
        if (isSendingSos.value || sosCountdown.value > 0) return
        sosCountdown.value = 5
        sosCountdownJob.value = scope.launch {
            while (sosCountdown.value > 0) {
                delay(1000L)
                sosCountdown.value -= 1
            }
            sendSos()
            sosCountdownJob.value = null
        }
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions(),
        onResult = { result ->
            val sms = result[Manifest.permission.SEND_SMS] == true
            val fine = result[Manifest.permission.ACCESS_FINE_LOCATION] == true
            val coarse = result[Manifest.permission.ACCESS_COARSE_LOCATION] == true
            val notifications = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                result[Manifest.permission.POST_NOTIFICATIONS] == true
            } else {
                true
            }
            if (sms && (fine || coarse)) {
                startSosCountdown()
            } else if (notifications) {
                notificationHelper.showSosFailed()
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

    LaunchedEffect(isNfcActive.value, userId) {
        if (!isNfcActive.value || userId.isEmpty()) return@LaunchedEffect
        try {
            val minted = withContext(Dispatchers.IO) {
                withTimeout(7000L) { repository.mintEmergencyLink() }
            }
            nfcShareUrl.value = minted
        } catch (_: Exception) {
            // If mint fails (offline), do not beam a broken URL.
            nfcShareUrl.value = ""
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
                    text = stringResource(R.string.emergency_id),
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Light,
                    color = Color.White,
                    textAlign = TextAlign.Center,
                    letterSpacing = 0.5.sp
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = stringResource(R.string.for_medical_emergencies),
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
                        text = if (isOnline.value) stringResource(R.string.online_sync) else stringResource(R.string.offline_mode),
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
                    contentDescription = stringResource(R.string.cd_language),
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

                if (profile.address.isNotBlank()) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(
                                MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f),
                                RoundedCornerShape(12.dp)
                            )
                            .padding(12.dp)
                    ) {
                        Text(
                            text = stringResource(R.string.address),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            letterSpacing = 0.4.sp
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = profile.address,
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurface,
                            lineHeight = 18.sp
                        )
                    }
                }

                if (profile.allergies.isNotEmpty()) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(
                                MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f),
                                RoundedCornerShape(12.dp)
                            )
                            .padding(12.dp)
                    ) {
                        Text(
                            text = stringResource(R.string.allergies),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            letterSpacing = 0.4.sp
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            profile.allergies.forEach { allergy ->
                                Text(
                                    text = allergy,
                                    fontSize = 13.sp,
                                    color = MaterialTheme.colorScheme.onSurface,
                                    lineHeight = 18.sp
                                )
                            }
                        }
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
                                text = stringResource(R.string.info),
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
                                        contentDescription = stringResource(R.string.cd_call),
                                        tint = MaterialTheme.colorScheme.primary
                                    )
                                }
                                IconButton(onClick = { launchSms(contact.phoneNumber) }) {
                                    Icon(
                                        imageVector = Icons.Outlined.Message,
                                        contentDescription = stringResource(R.string.cd_sms),
                                        tint = MaterialTheme.colorScheme.secondary
                                    )
                                }
                                IconButton(onClick = { copyNumber(contact.phoneNumber) }) {
                                    Icon(
                                        imageVector = Icons.Outlined.ContentCopy,
                                        contentDescription = stringResource(R.string.cd_copy),
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
                    if (hasSosPermissions()) {
                        startSosCountdown()
                    } else {
                        val permissions = mutableListOf(
                            Manifest.permission.SEND_SMS,
                            Manifest.permission.ACCESS_FINE_LOCATION,
                            Manifest.permission.ACCESS_COARSE_LOCATION
                        )
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
                        }
                        permissionLauncher.launch(permissions.toTypedArray())
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.error
                ),
                enabled = !isSendingSos.value && sosCountdown.value == 0
            ) {
                Text(
                    text = if (isSendingSos.value) stringResource(R.string.sos_sending_short) else stringResource(R.string.sos_send),
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    letterSpacing = 0.5.sp,
                    color = MaterialTheme.colorScheme.onError
                )
            }

            if (sosCountdown.value > 0) {
                Text(
                    text = "SOS sending in ${sosCountdown.value}s",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Button(
                    onClick = { cancelSosCountdown() },
                    modifier = Modifier
                        .fillMaxWidth(0.75f)
                        .height(42.dp),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant
                    )
                ) {
                    Text(
                        text = "Cancel SOS",
                        fontWeight = FontWeight.Medium,
                        fontSize = 13.sp
                    )
                }
            }

            Button(
                onClick = {
                    if (hasSosPermissions()) {
                        sendSos(isTestMode = true)
                    } else {
                        Toast.makeText(context, "Grant SOS permissions first, then run Test SOS.", Toast.LENGTH_SHORT).show()
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(44.dp),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.secondary
                ),
                enabled = !isSendingSos.value && sosCountdown.value == 0
            ) {
                Text(
                    text = "Test SOS (no SMS)",
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 13.sp,
                    letterSpacing = 0.3.sp
                )
            }

            Button(
                onClick = {
                    notificationHelper.showTestLockScreenQrAlert(userId)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(44.dp),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.tertiary
                )
            ) {
                Text(
                    text = "Test Lock Alert + QR",
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 13.sp,
                    letterSpacing = 0.3.sp
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
