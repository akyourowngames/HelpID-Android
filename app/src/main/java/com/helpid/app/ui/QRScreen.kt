package com.helpid.app.ui

import android.app.Activity
import android.graphics.Bitmap
import android.graphics.Color
import android.nfc.NdefMessage
import android.nfc.NdefRecord
import android.nfc.NfcAdapter
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
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
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.Image
import androidx.compose.ui.draw.shadow
import com.google.zxing.BarcodeFormat
import com.google.zxing.qrcode.QRCodeWriter
import com.helpid.app.data.FirebaseRepository
import com.helpid.app.R
import com.helpid.app.ui.components.GhostButton
import com.helpid.app.ui.components.ScreenHeader
import com.helpid.app.ui.components.ShimmerPlaceholder
import com.helpid.app.ui.theme.HelpIDTheme
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

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
fun QRScreen(
    userId: String,
    onBackClick: () -> Unit = {}
) {
    val context = LocalContext.current
    val activity = context as? Activity
    val repository = remember { FirebaseRepository(context) }
    val nfcAdapter = remember { NfcAdapter.getDefaultAdapter(context) }
    val isNfcActive = remember { mutableStateOf(false) }
    val qrContentState = remember { mutableStateOf("") }
    val isMinting = remember { mutableStateOf(false) }
    val mintError = remember { mutableStateOf<String?>(null) }
    val mintNonce = remember { mutableStateOf(0) }
    val qrBitmap = remember { mutableStateOf<Bitmap?>(null) }

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

    DisposableEffect(isNfcActive.value, qrContentState.value) {
        val qrContent = qrContentState.value
        if (nfcAdapter == null || activity == null || qrContent.isEmpty()) {
            onDispose { }
        } else {
            if (isNfcActive.value) {
                val message = NdefMessage(
                    arrayOf(NdefRecord.createUri(qrContent))
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

    suspend fun mintAndUpdate() {
        if (userId.isEmpty()) return
        isMinting.value = true
        mintError.value = null

        val minted = repository.mintEmergencyLink()
        if (minted.isBlank()) {
            mintError.value = context.getString(R.string.qr_mint_error)
            qrContentState.value = ""
            qrBitmap.value = null
            isMinting.value = false
            return
        }

        qrContentState.value = minted
        qrBitmap.value = withContext(Dispatchers.Default) {
            generateQRCode(minted, 512)
        }
        isMinting.value = false
    }

    LaunchedEffect(userId, mintNonce.value) {
        mintAndUpdate()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.Top,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        ScreenHeader(
            title = stringResource(R.string.emergency_access),
            subtitle = stringResource(R.string.scan_to_view),
            onBackClick = onBackClick
        )

        Spacer(modifier = Modifier.height(24.dp))

        // NFC Tap-to-Assist Section
        Box(
            modifier = Modifier
                .padding(horizontal = 16.dp)
                .background(MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(14.dp))
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = stringResource(R.string.qr_nfc_title),
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = stringResource(R.string.qr_nfc_subtitle),
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(12.dp))
                if (nfcAdapter != null) {
                    Button(
                        onClick = { isNfcActive.value = !isNfcActive.value },
                        modifier = Modifier
                            .height(38.dp)
                            .fillMaxWidth(0.7f),
                        shape = RoundedCornerShape(20.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isNfcActive.value) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface,
                            contentColor = if (isNfcActive.value) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
                        )
                    ) {
                        Text(
                            text = if (isNfcActive.value) {
                                stringResource(R.string.qr_nfc_active)
                            } else {
                                stringResource(R.string.qr_nfc_enable)
                            },
                            fontSize = 11.sp,
                            letterSpacing = 0.6.sp
                        )
                    }
                } else {
                    Text(
                        text = stringResource(R.string.qr_nfc_unavailable),
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // QR Code Container
        Box(
            modifier = Modifier
                .padding(horizontal = 16.dp)
                .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(14.dp))
                .shadow(elevation = 1.dp, shape = RoundedCornerShape(14.dp))
                .padding(20.dp),
            contentAlignment = Alignment.Center
        ) {
            val bitmap = qrBitmap.value
            if (isMinting.value) {
                ShimmerPlaceholder(
                    modifier = Modifier.size(260.dp),
                    cornerRadius = 12.dp
                )
            } else if (bitmap == null) {
                ShimmerPlaceholder(
                    modifier = Modifier.size(260.dp),
                    cornerRadius = 12.dp
                )
            } else {
                Image(
                    bitmap = bitmap.asImageBitmap(),
                    contentDescription = stringResource(R.string.qr_content_description),
                    modifier = Modifier.size(260.dp),
                    contentScale = ContentScale.Fit
                )
            }
        }

        if (mintError.value != null) {
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = mintError.value ?: "",
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.error,
                textAlign = TextAlign.Center,
                modifier = Modifier
                    .fillMaxWidth(0.9f)
                    .padding(horizontal = 16.dp)
            )
            Spacer(modifier = Modifier.height(10.dp))
            Button(
                onClick = { 
                    if (!isMinting.value) {
                        // retry mint
                        mintError.value = null
                        mintNonce.value = mintNonce.value + 1
                    }
                },
                modifier = Modifier
                    .height(42.dp)
                    .fillMaxWidth(0.6f),
                shape = RoundedCornerShape(20.dp)
            ) {
                Text(text = stringResource(R.string.retry), fontSize = 12.sp, letterSpacing = 0.6.sp)
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Info Section - Brief & Clear
        Text(
            text = stringResource(R.string.scan_this_code),
            fontSize = 13.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
            lineHeight = 19.sp,
            fontWeight = FontWeight.Light,
            modifier = Modifier
                .fillMaxWidth(0.85f)
                .padding(horizontal = 16.dp)
        )
        Spacer(modifier = Modifier.height(20.dp))

        GhostButton(
            text = stringResource(R.string.back),
            onClick = onBackClick,
            modifier = Modifier
                .fillMaxWidth(0.85f)
                .height(50.dp)
        )

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Preview(showBackground = true)
@Composable
fun QRScreenPreview() {
    HelpIDTheme {
        QRScreen(userId = "demo-user-id")
    }
}
