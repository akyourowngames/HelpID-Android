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
import androidx.compose.material3.CircularProgressIndicator
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.helpid.app.data.FirebaseRepository
import com.helpid.app.ui.EditProfileScreen
import com.helpid.app.ui.EmergencyScreen
import com.helpid.app.ui.LanguageSelectionScreen
import com.helpid.app.ui.QRScreen
import com.helpid.app.ui.theme.HelpIDTheme
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout

private const val TAG = "HelpID"

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.d(TAG, "MainActivity onCreate called")
        try {
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
        } catch (e: Exception) {
            Log.e(TAG, "Error in setContent: ${e.message}", e)
            e.printStackTrace()
        }
    }
}

@Composable
fun AppNavigation() {
    Log.d(TAG, "AppNavigation composable called")
    
    val currentScreen = remember { mutableStateOf("emergency") }
    val userId = remember { mutableStateOf("") }
    val isInitError = remember { mutableStateOf<String?>(null) }
    val repository = remember { FirebaseRepository() }

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
                        } else {
                            Log.w(TAG, "userId is empty")
                            isInitError.value = "Failed to get user ID"
                        }
                    }
                } catch (e: TimeoutCancellationException) {
                    Log.w(TAG, "Firebase initialization timed out after 10 seconds")
                    isInitError.value = "Initialization timeout - using offline mode"
                    // Use a demo/offline user ID
                    userId.value = "offline_user_${System.currentTimeMillis()}"
                } catch (e: Exception) {
                    Log.e(TAG, "Error during Firebase init: ${e.message}", e)
                    isInitError.value = e.message ?: "Unknown error"
                    // Use offline user ID on any error
                    userId.value = "offline_user_${System.currentTimeMillis()}"
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception in LaunchedEffect: ${e.message}", e)
            isInitError.value = e.message ?: "Unknown error"
            userId.value = "offline_user_${System.currentTimeMillis()}"
        }
    }

    // Don't wait for initialization - go straight to emergency screen
    // The profile loading happens inside EmergencyScreen
    when (currentScreen.value) {
        "emergency" -> {
            Log.d(TAG, "Rendering EmergencyScreen")
            EmergencyScreen(
                userId = userId.value,
                initError = isInitError.value,
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
