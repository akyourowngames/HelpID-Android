package com.helpid.app

import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.helpid.app.data.FirebaseRepository
import com.helpid.app.ui.EditProfileScreen
import com.helpid.app.ui.EmergencyScreen
import com.helpid.app.ui.LanguageSelectionScreen
import com.helpid.app.ui.QRScreen
import com.helpid.app.ui.components.ShimmerPlaceholder
import com.helpid.app.ui.components.SkeletonSpacer
import com.helpid.app.ui.components.SkeletonTextLine
import com.helpid.app.ui.theme.HelpIDTheme
import com.helpid.app.utils.LanguageManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout

private const val TAG = "HelpID"

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Restore saved language
        val savedLanguage = LanguageManager.getSelectedLanguage(this)
        LanguageManager.setLanguage(this, savedLanguage)

        setContent {
            HelpIDTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AppNavigation()
                }
            }
        }
    }
}

@Composable
private fun InitSkeleton(errorText: String?) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        ShimmerPlaceholder(
            modifier = Modifier
                .size(48.dp)
        )
        SkeletonSpacer(16.dp)
        SkeletonTextLine(widthFraction = 0.4f, height = 12.dp)
        if (errorText != null) {
            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = "Error: $errorText",
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.error
            )
        }
    }
}

@Composable
fun AppNavigation() {
    Log.d(TAG, "AppNavigation composable called")
    
    val currentScreen = remember { mutableStateOf("emergency") }
    val userId = remember { mutableStateOf("") }
    val isInitialized = remember { mutableStateOf(false) }
    val initError = remember { mutableStateOf<String?>(null) }
    val context = LocalContext.current
    val repository = remember { FirebaseRepository(context) }

    // Initialize Firebase with timeout
    LaunchedEffect(Unit) {
        Log.d(TAG, "LaunchedEffect: Starting Firebase initialization")
        try {
            withContext(Dispatchers.IO) {
                try {
                    Log.d(TAG, "Attempting initialization with 10 second timeout")
                    withTimeout(10000L) {  // 10 second timeout
                        val initUserId = repository.initializeUser()
                        Log.d(TAG, "Firebase initialized successfully, userId: $initUserId")
                        
                        if (initUserId.isNotEmpty()) {
                            userId.value = initUserId
                            isInitialized.value = true
                        } else {
                            Log.w(TAG, "userId is empty")
                            initError.value = "Failed to initialize user"
                        }
                    }
                } catch (e: TimeoutCancellationException) {
                    Log.w(TAG, "Firebase initialization timed out after 10 seconds")
                    initError.value = "Initialization timeout"
                } catch (e: Exception) {
                    Log.e(TAG, "Error during Firebase init: ${e.message}", e)
                    initError.value = e.message ?: "Unknown error"
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception in LaunchedEffect: ${e.message}", e)
            initError.value = e.message ?: "Unknown error"
        }
    }

    if (!isInitialized.value) {
        InitSkeleton(initError.value)
        return
    }

    when (currentScreen.value) {
        "emergency" -> {
            Log.d(TAG, "Rendering EmergencyScreen")
            EmergencyScreen(
                userId = userId.value,
                onShowQRClick = { currentScreen.value = "qr" },
                onEditClick = { currentScreen.value = "edit" },
                onLanguageClick = { currentScreen.value = "language" }
            )
        }
        "qr" -> {
            Log.d(TAG, "Rendering QRScreen")
            QRScreen(
                userId = userId.value,
                onBackClick = { currentScreen.value = "emergency" }
            )
        }
        "edit" -> {
            Log.d(TAG, "Rendering EditProfileScreen")
            EditProfileScreen(
                userId = userId.value,
                onBackClick = { currentScreen.value = "emergency" },
                onSaveSuccess = { currentScreen.value = "emergency" }
            )
        }
        "language" -> {
            Log.d(TAG, "Rendering LanguageSelectionScreen")
            LanguageSelectionScreen(
                onLanguageSelected = { currentScreen.value = "emergency" },
                onBackClick = { currentScreen.value = "emergency" }
            )
        }
    }
}
