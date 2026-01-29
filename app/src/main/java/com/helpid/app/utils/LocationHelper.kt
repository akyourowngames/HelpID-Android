package com.helpid.app.utils

import android.annotation.SuppressLint
import android.content.Context
import android.location.Location
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import com.google.android.gms.tasks.Tasks
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class LocationHelper(private val context: Context) {
    private val fusedLocationClient = LocationServices.getFusedLocationProviderClient(context)

    @SuppressLint("MissingPermission")
    suspend fun getCurrentLocation(): Location? {
        return withContext(Dispatchers.IO) {
            try {
                // Try to get the last known location first as it's faster
                val lastLocation = Tasks.await(fusedLocationClient.lastLocation)
                if (lastLocation != null) {
                    return@withContext lastLocation
                }

                // If no last known location, request a fresh one
                // utilizing High Accuracy
                val cancellationTokenSource = CancellationTokenSource()
                val currentLocationTask = fusedLocationClient.getCurrentLocation(
                    Priority.PRIORITY_HIGH_ACCURACY,
                    cancellationTokenSource.token
                )

                Tasks.await(currentLocationTask)
            } catch (e: Exception) {
                e.printStackTrace()
                null
            }
        }
    }
}
