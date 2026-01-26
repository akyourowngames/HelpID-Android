package com.helpid.app

import android.os.Bundle
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
import com.helpid.app.utils.LanguageManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
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
fun AppNavigation() {
    val currentScreen = remember { mutableStateOf("emergency") }
    val userId = remember { mutableStateOf("") }
    val isInitialized = remember { mutableStateOf(false) }
    val initError = remember { mutableStateOf<String?>(null) }
    val repository = remember { FirebaseRepository() }

    // Initialize Firebase and create anonymous user
    LaunchedEffect(Unit) {
        try {
            withContext(Dispatchers.IO) {
                val initUserId = repository.initializeUser()
                if (initUserId.isNotEmpty()) {
                    userId.value = initUserId
                    isInitialized.value = true
                } else {
                    initError.value = "Failed to initialize user"
                }
            }
        } catch (e: Exception) {
            initError.value = e.message ?: "Unknown error"
            e.printStackTrace()
        }
    }

    if (!isInitialized.value) {
        // Show loading state
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFFAFAFA)),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            CircularProgressIndicator(
                color = Color(0xFFD32F2F)
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Initializing...",
                fontSize = 14.sp,
                color = Color(0xFF999999)
            )
            if (initError.value != null) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Error: ${initError.value}",
                    fontSize = 12.sp,
                    color = Color(0xFFD32F2F)
                )
            }
        }
        return
    }

    when (currentScreen.value) {
        "emergency" -> {
            EmergencyScreen(
                userId = userId.value,
                onShowQRClick = { currentScreen.value = "qr" },
                onEditClick = { currentScreen.value = "edit" },
                onLanguageClick = { currentScreen.value = "language" }
            )
        }
        "qr" -> {
            QRScreen(
                userId = userId.value,
                onBackClick = { currentScreen.value = "emergency" }
            )
        }
        "edit" -> {
            EditProfileScreen(
                userId = userId.value,
                onBackClick = { currentScreen.value = "emergency" },
                onSaveSuccess = { currentScreen.value = "emergency" }
            )
        }
        "language" -> {
            LanguageSelectionScreen(
                onLanguageSelected = { currentScreen.value = "emergency" },
                onBackClick = { currentScreen.value = "emergency" }
            )
        }
    }
}
