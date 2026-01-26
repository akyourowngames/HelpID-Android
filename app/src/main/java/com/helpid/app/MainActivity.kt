package com.helpid.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import com.helpid.app.ui.EmergencyScreen
import com.helpid.app.ui.QRScreen
import com.helpid.app.ui.theme.HelpIDTheme

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

    when (currentScreen.value) {
        "emergency" -> {
            EmergencyScreen(
                onShowQRClick = { currentScreen.value = "qr" }
            )
        }
        "qr" -> {
            QRScreen(
                onBackClick = { currentScreen.value = "emergency" }
            )
        }
    }
}
