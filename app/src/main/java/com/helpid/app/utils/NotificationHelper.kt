package com.helpid.app.utils

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.helpid.app.MainActivity
import com.helpid.app.R

class NotificationHelper(private val context: Context) {
    companion object {
        private const val CHANNEL_ID = "sos_alerts"
        private const val CHANNEL_NAME = "Emergency Alerts"
        private const val CHANNEL_DESC = "SOS delivery updates"
        private const val FULLSCREEN_CHANNEL_ID = "sos_test_fullscreen"
        private const val FULLSCREEN_CHANNEL_NAME = "Test Emergency Alerts"
        private const val FULLSCREEN_CHANNEL_DESC = "Test full-screen emergency alert on lock screen"
        private const val DELIVERED_ID = 2001
        private const val FAILED_ID = 2002
        private const val TEST_FULLSCREEN_ID = 2101
    }

    fun showSosDelivered() {
        ensureChannel()
        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(context.getString(R.string.notification_sos_delivered_title))
            .setContentText(context.getString(R.string.notification_sos_delivered_text))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_STATUS)
            .setAutoCancel(true)
            .build()

        if (ActivityCompat.checkSelfPermission(
                context,
                Manifest.permission.POST_NOTIFICATIONS
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            // TODO: Consider calling
            //    ActivityCompat#requestPermissions
            // here to request the missing permissions, and then overriding
            //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
            //                                          int[] grantResults)
            // to handle the case where the user grants the permission. See the documentation
            // for ActivityCompat#requestPermissions for more details.
            return
        }
        NotificationManagerCompat.from(context).notify(DELIVERED_ID, notification)
    }

    fun showSosFailed() {
        ensureChannel()
        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(context.getString(R.string.notification_sos_failed_title))
            .setContentText(context.getString(R.string.notification_sos_failed_text))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ERROR)
            .setAutoCancel(true)
            .build()

        if (ActivityCompat.checkSelfPermission(
                context,
                Manifest.permission.POST_NOTIFICATIONS
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            // TODO: Consider calling
            //    ActivityCompat#requestPermissions
            // here to request the missing permissions, and then overriding
            //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
            //                                          int[] grantResults)
            // to handle the case where the user grants the permission. See the documentation
            // for ActivityCompat#requestPermissions for more details.
            return
        }
        NotificationManagerCompat.from(context).notify(FAILED_ID, notification)
    }

    fun showTestLockScreenQrAlert(userId: String) {
        ensureFullScreenChannel()
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("open_screen", "qr")
            putExtra("fullscreen_test", true)
            putExtra("user_id", userId)
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            9001,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, FULLSCREEN_CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("Test Emergency Alert")
            .setContentText("Tap to open emergency QR on lock screen")
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_CALL)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setFullScreenIntent(pendingIntent, true)
            .build()

        if (ActivityCompat.checkSelfPermission(
                context,
                Manifest.permission.POST_NOTIFICATIONS
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            return
        }
        NotificationManagerCompat.from(context).notify(TEST_FULLSCREEN_ID, notification)
    }

    private fun ensureChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channel = NotificationChannel(
            CHANNEL_ID,
            CHANNEL_NAME,
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = CHANNEL_DESC
            enableVibration(true)
            lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
        }
        manager.createNotificationChannel(channel)
    }

    private fun ensureFullScreenChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channel = NotificationChannel(
            FULLSCREEN_CHANNEL_ID,
            FULLSCREEN_CHANNEL_NAME,
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = FULLSCREEN_CHANNEL_DESC
            enableVibration(true)
            lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
        }
        manager.createNotificationChannel(channel)
    }
}
