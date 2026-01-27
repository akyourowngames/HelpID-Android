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
import kotlinx.coroutines.withContext

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
    val isInitialized = remember { mutableStateOf(false) }
    val initError = remember { mutableStateOf<String?>(null) }
    
    // Initialize Firebase and create anonymous user
    LaunchedEffect(Unit) {
        Log.d(TAG, "LaunchedEffect starting initialization")
        try {
            withContext(Dispatchers.IO) {
                try {
                    val repository = FirebaseRepository()
                    Log.d(TAG, "FirebaseRepository created")
                    
                    val initUserId = repository.initializeUser()
                    Log.d(TAG, "Firebase initialized, userId: $initUserId")
                    
                    if (initUserId.isNotEmpty()) {
                        userId.value = initUserId
                    } else {
                        initError.value = "Failed to get user ID"
                        Log.w(TAG, "Failed to get user ID")
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error during Firebase init: ${e.message}", e)
                    initError.value = e.message ?: "Unknown error"
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error in LaunchedEffect: ${e.message}", e)
            initError.value = e.message ?: "Unknown error"
        } finally {
            isInitialized.value = true
            Log.d(TAG, "Initialization complete. isInitialized=${isInitialized.value}, userId=${userId.value}")
        }
    }

    // Show loading or content
    if (!isInitialized.value) {
        Log.d(TAG, "Showing initialization loading screen")
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFFAFAFA)),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            CircularProgressIndicator(color = Color(0xFFD32F2F))
            Spacer(modifier = Modifier.height(16.dp))
            Text("Initializing app...", fontSize = 14.sp, color = Color(0xFF999999))
            if (initError.value != null) {
                Spacer(modifier = Modifier.height(8.dp))
                Text("Status: ${initError.value}", fontSize = 11.sp, color = Color(0xFF666666))
            }
        }
        return
    }

    Log.d(TAG, "Initialization complete, rendering screen: ${currentScreen.value}")
    
    // Render appropriate screen
    when (currentScreen.value) {
        "emergency" -> {
            Log.d(TAG, "Rendering EmergencyScreen with userId: ${userId.value}")
            EmergencyScreen(
                userId = userId.value,
                onShowQRClick = { 
                    Log.d(TAG, "QR click")
                    currentScreen.value = "qr" 
                },
                onEditClick = { 
                    Log.d(TAG, "Edit click")
                    currentScreen.value = "edit" 
                },
                onLanguageClick = { 
                    Log.d(TAG, "Language click")
                    currentScreen.value = "language" 
                }
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
