package com.helpid.app.utils

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.helpid.app.R

class NotificationHelper(private val context: Context) {
    companion object {
        private const val CHANNEL_ID = "sos_alerts"
        private const val CHANNEL_NAME = "Emergency Alerts"
        private const val CHANNEL_DESC = "SOS delivery updates"
        private const val DELIVERED_ID = 2001
        private const val FAILED_ID = 2002
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

        NotificationManagerCompat.from(context).notify(FAILED_ID, notification)
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
}
