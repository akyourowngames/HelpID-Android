package com.helpid.app.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.helpid.app.R
import com.helpid.app.ui.components.GhostButton
import com.helpid.app.ui.components.PrimaryButton
import com.helpid.app.ui.components.ScreenHeader
import com.helpid.app.utils.LanguageManager

@Composable
fun LanguageSelectionScreen(
    onLanguageSelected: () -> Unit = {},
    onBackClick: () -> Unit = {}
) {
    val context = LocalContext.current
    val selectedLanguage = remember { mutableStateOf(LanguageManager.getSelectedLanguage(context)) }
    val languages = remember { LanguageManager.getAvailableLanguages() }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        MaterialTheme.colorScheme.surface,
                        MaterialTheme.colorScheme.background
                    )
                )
            )
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.Top,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        ScreenHeader(
            title = stringResource(R.string.select_language),
            subtitle = stringResource(R.string.choose_language_helper),
            onBackClick = onBackClick
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Language Selection Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .shadow(elevation = 2.dp, shape = RoundedCornerShape(16.dp)),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
                    .animateContentSize(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                languages.forEach { language ->
                    LanguageOption(
                        language = language,
                        isSelected = selectedLanguage.value == language,
                        onSelect = { selectedLanguage.value = language }
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Action Buttons
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            PrimaryButton(
                text = stringResource(R.string.apply),
                onClick = {
                    LanguageManager.setLanguage(context, selectedLanguage.value)
                    onLanguageSelected()
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
            )

            GhostButton(
                text = stringResource(R.string.back),
                onClick = onBackClick,
                modifier = Modifier
                    .fillMaxWidth(0.7f)
                    .height(40.dp)
            )
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
fun LanguageOption(
    language: LanguageManager.Language,
    isSelected: Boolean,
    onSelect: () -> Unit
) {
    val targetScale = if (isSelected) 1f else 0.98f
    val scale by animateFloatAsState(targetScale, label = "languageScale")
    val backgroundColor by animateColorAsState(
        if (isSelected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant,
        label = "languageBackground"
    )
    val contentColor by animateColorAsState(
        if (isSelected) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurface,
        label = "languageContent"
    )
    val elevation by animateDpAsState(if (isSelected) 4.dp else 0.dp, label = "languageElevation")

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .graphicsLayer(scaleX = scale, scaleY = scale)
            .clickable(onClick = onSelect)
            .background(
                color = backgroundColor,
                shape = RoundedCornerShape(12.dp)
            )
            .shadow(elevation = elevation, shape = RoundedCornerShape(12.dp))
            .clip(RoundedCornerShape(12.dp))
            .padding(horizontal = 14.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            modifier = Modifier.weight(1f),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Text(
                text = languageEmoji(language),
                fontSize = 18.sp
            )
            Column {
                Text(
                    text = language.displayName,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = contentColor
                )
                AnimatedVisibility(visible = isSelected) {
                    AssistChip(
                        onClick = onSelect,
                        label = {
                            Text(
                                text = "Selected",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        },
                        colors = AssistChipDefaults.assistChipColors(
                            containerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.12f),
                            labelColor = MaterialTheme.colorScheme.primary
                        ),
                        border = AssistChipDefaults.assistChipBorder()
                    )
                }
            }
        }
        RadioButton(
            selected = isSelected,
            onClick = onSelect,
            colors = RadioButtonDefaults.colors(
                selectedColor = MaterialTheme.colorScheme.primary,
                unselectedColor = MaterialTheme.colorScheme.onSurfaceVariant
            )
        )
    }
}

private fun languageEmoji(language: LanguageManager.Language): String {
    return when (language) {
        LanguageManager.Language.ENGLISH -> "🇺🇸"
        LanguageManager.Language.SPANISH -> "🇪🇸"
        LanguageManager.Language.HINDI -> "🇮🇳"
        LanguageManager.Language.FRENCH -> "🇫🇷"
        LanguageManager.Language.GERMAN -> "🇩🇪"
    }
}
