package com.helpid.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import com.helpid.app.data.FirebaseRepository
import com.helpid.app.ui.EditProfileScreen
import com.helpid.app.ui.EmergencyScreen
import com.helpid.app.ui.QRScreen
import com.helpid.app.ui.theme.HelpIDTheme
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
    val repository = remember { FirebaseRepository() }

    // Initialize Firebase and create anonymous user
    LaunchedEffect(Unit) {
        withContext(Dispatchers.IO) {
            val initUserId = repository.initializeUser()
            userId.value = initUserId
            isInitialized.value = true
        }
    }

    if (!isInitialized.value) {
        // Show loading state
        return
    }

    when (currentScreen.value) {
        "emergency" -> {
            EmergencyScreen(
                userId = userId.value,
                onShowQRClick = { currentScreen.value = "qr" },
                onEditClick = { currentScreen.value = "edit" }
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
    }
}
