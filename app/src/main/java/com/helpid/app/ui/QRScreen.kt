package com.helpid.app.ui

import android.graphics.Bitmap
import android.graphics.Color
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color as ComposeColor
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Box
import androidx.compose.ui.draw.shadow
import com.google.zxing.BarcodeFormat
import com.google.zxing.qrcode.QRCodeWriter
import com.helpid.app.ui.theme.HelpIDTheme

fun generateQRCode(text: String, size: Int = 512): Bitmap {
    val writer = QRCodeWriter()
    val bitMatrix = writer.encode(text, BarcodeFormat.QR_CODE, size, size)
    val width = bitMatrix.width
    val height = bitMatrix.height
    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565)
    
    for (x in 0 until width) {
        for (y in 0 until height) {
            bitmap.setPixel(x, y, if (bitMatrix[x, y]) Color.BLACK else Color.WHITE)
        }
    }
    return bitmap
}

@Composable
fun QRScreen(onBackClick: () -> Unit = {}) {
    val qrContent = "https://helpid.app/emergency/johndoe"
    val qrBitmap = generateQRCode(qrContent, 512)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(ComposeColor(0xFFFAFAFA))
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.Top,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Header
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(ComposeColor(0xFF1A1A1A))
                .padding(24.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "📱",
                fontSize = 40.sp
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "Emergency QR",
                fontSize = 24.sp,
                fontWeight = FontWeight.Light,
                color = ComposeColor.White,
                textAlign = TextAlign.Center,
                letterSpacing = 0.5.sp
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Scan for instant access",
                fontSize = 12.sp,
                color = ComposeColor.White.copy(alpha = 0.6f),
                textAlign = TextAlign.Center,
                letterSpacing = 0.3.sp
            )
        }

        Spacer(modifier = Modifier.height(28.dp))

        // QR Code Container
        Box(
            modifier = Modifier
                .padding(horizontal = 16.dp)
                .background(ComposeColor.White, RoundedCornerShape(12.dp))
                .shadow(elevation = 1.dp, shape = RoundedCornerShape(12.dp))
                .padding(20.dp),
            contentAlignment = Alignment.Center
        ) {
            Image(
                bitmap = qrBitmap.asImageBitmap(),
                contentDescription = "Emergency QR Code",
                modifier = Modifier.size(260.dp),
                contentScale = ContentScale.Fit
            )
        }

        Spacer(modifier = Modifier.height(28.dp))

        // Info Section
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = "How It Works",
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                color = ComposeColor(0xFF1A1A1A),
                letterSpacing = 0.3.sp
            )
            Text(
                text = "Anyone can scan this QR code to access your emergency information, even if your phone is locked or offline.",
                fontSize = 13.sp,
                color = ComposeColor(0xFF666666),
                textAlign = TextAlign.Center,
                lineHeight = 19.sp,
                fontWeight = FontWeight.Light
            )
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Back Button
        Button(
            onClick = onBackClick,
            modifier = Modifier
                .fillMaxWidth(0.85f)
                .height(50.dp),
            shape = RoundedCornerShape(10.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = ComposeColor(0xFF1A1A1A)
            )
        ) {
            Text(
                text = "BACK TO ID CARD",
                fontWeight = FontWeight.SemiBold,
                fontSize = 14.sp,
                letterSpacing = 0.5.sp
            )
        }

        Spacer(modifier = Modifier.height(28.dp))
    }
}

@Preview(showBackground = true)
@Composable
fun QRScreenPreview() {
    HelpIDTheme {
        QRScreen()
    }
}
