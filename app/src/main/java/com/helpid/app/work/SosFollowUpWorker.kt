package com.helpid.app.work

import android.Manifest
import android.content.Context
import android.location.Location
import android.telephony.SmsManager
import androidx.core.content.ContextCompat
import androidx.work.CoroutineWorker
import androidx.work.Data
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.Tasks
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.TimeUnit

class SosFollowUpWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        val phones = inputData.getStringArray(KEY_PHONES)?.filter { it.isNotBlank() }.orEmpty()
        val userName = inputData.getString(KEY_USER_NAME).orEmpty()
        val bloodGroup = inputData.getString(KEY_BLOOD_GROUP).orEmpty()
        val remainingUpdates = inputData.getInt(KEY_REMAINING_UPDATES, 0)
        val intervalMinutes = inputData.getInt(KEY_INTERVAL_MINUTES, DEFAULT_INTERVAL_MINUTES)

        if (phones.isEmpty() || remainingUpdates <= 0) return Result.success()

        val hasSms = ContextCompat.checkSelfPermission(
            applicationContext,
            Manifest.permission.SEND_SMS
        ) == android.content.pm.PackageManager.PERMISSION_GRANTED
        if (!hasSms) return Result.success()

        val location = getLocationOrNull()
        val mapsLink = if (location != null) {
            "https://maps.google.com/?q=${location.latitude},${location.longitude}"
        } else {
            ""
        }
        val timestamp = SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(Date())
        val msg = buildString {
            append("SOS UPDATE: I still need help.")
            if (userName.isNotBlank()) append("\nName: $userName")
            if (bloodGroup.isNotBlank()) append("\nBlood: $bloodGroup")
            append("\nTime: $timestamp")
            if (mapsLink.isNotBlank()) append("\nLocation: $mapsLink")
        }

        val smsManager = SmsManager.getDefault()
        phones.forEach { phone ->
            try {
                smsManager.sendTextMessage(phone, null, msg, null, null)
            } catch (_: Exception) {
            }
        }

        val nextRemaining = remainingUpdates - 1
        if (nextRemaining > 0) {
            enqueueNext(
                phones = phones.toTypedArray(),
                userName = userName,
                bloodGroup = bloodGroup,
                remainingUpdates = nextRemaining,
                intervalMinutes = intervalMinutes
            )
        }

        return Result.success()
    }

    private fun enqueueNext(
        phones: Array<String>,
        userName: String,
        bloodGroup: String,
        remainingUpdates: Int,
        intervalMinutes: Int
    ) {
        val request = OneTimeWorkRequestBuilder<SosFollowUpWorker>()
            .setInitialDelay(intervalMinutes.toLong(), TimeUnit.MINUTES)
            .setInputData(
                inputDataOf(
                    phones = phones,
                    userName = userName,
                    bloodGroup = bloodGroup,
                    remainingUpdates = remainingUpdates,
                    intervalMinutes = intervalMinutes
                )
            )
            .build()

        WorkManager.getInstance(applicationContext)
            .enqueueUniqueWork(WORK_NAME, ExistingWorkPolicy.REPLACE, request)
    }

    private fun getLocationOrNull(): Location? {
        val hasFine = ContextCompat.checkSelfPermission(
            applicationContext,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == android.content.pm.PackageManager.PERMISSION_GRANTED
        val hasCoarse = ContextCompat.checkSelfPermission(
            applicationContext,
            Manifest.permission.ACCESS_COARSE_LOCATION
        ) == android.content.pm.PackageManager.PERMISSION_GRANTED

        if (!hasFine && !hasCoarse) return null

        return try {
            val fused = LocationServices.getFusedLocationProviderClient(applicationContext)
            Tasks.await(fused.lastLocation) ?: Tasks.await(
                fused.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, null)
            )
        } catch (_: Exception) {
            null
        }
    }

    companion object {
        const val WORK_NAME = "helpid_sos_follow_up"
        const val DEFAULT_INTERVAL_MINUTES = 3
        const val DEFAULT_UPDATES = 4

        private const val KEY_PHONES = "phones"
        private const val KEY_USER_NAME = "user_name"
        private const val KEY_BLOOD_GROUP = "blood_group"
        private const val KEY_REMAINING_UPDATES = "remaining_updates"
        private const val KEY_INTERVAL_MINUTES = "interval_minutes"

        fun inputDataOf(
            phones: Array<String>,
            userName: String,
            bloodGroup: String,
            remainingUpdates: Int = DEFAULT_UPDATES,
            intervalMinutes: Int = DEFAULT_INTERVAL_MINUTES
        ): Data {
            return Data.Builder()
                .putStringArray(KEY_PHONES, phones)
                .putString(KEY_USER_NAME, userName)
                .putString(KEY_BLOOD_GROUP, bloodGroup)
                .putInt(KEY_REMAINING_UPDATES, remainingUpdates)
                .putInt(KEY_INTERVAL_MINUTES, intervalMinutes)
                .build()
        }
    }
}
