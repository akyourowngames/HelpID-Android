package com.helpid.app.ui.components

import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

@Composable
fun ShimmerPlaceholder(
    modifier: Modifier = Modifier,
    cornerRadius: Dp = 10.dp
) {
    val transition = rememberInfiniteTransition(label = "shimmer")
    val progress by transition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1100),
            repeatMode = RepeatMode.Restart
        ),
        label = "shimmerProgress"
    )

    val onSurface = MaterialTheme.colorScheme.onSurface
    val base = onSurface.copy(alpha = 0.06f)
    val highlight = onSurface.copy(alpha = 0.14f)
    val end = onSurface.copy(alpha = 0.08f)

    val startX = -900f + (1800f * progress)
    val brush = Brush.linearGradient(
        colors = listOf(base, highlight, end),
        start = Offset(startX, 0f),
        end = Offset(startX + 600f, 600f)
    )

    Box(
        modifier = modifier.background(
            brush = brush,
            shape = RoundedCornerShape(cornerRadius)
        )
    )
}

@Composable
fun SkeletonTextLine(
    widthFraction: Float = 1f,
    height: Dp = 14.dp
) {
    ShimmerPlaceholder(
        modifier = Modifier
            .fillMaxWidth(widthFraction)
            .height(height),
        cornerRadius = 6.dp
    )
}

@Composable
fun SkeletonSpacer(height: Dp = 10.dp) {
    Spacer(modifier = Modifier.height(height))
}
