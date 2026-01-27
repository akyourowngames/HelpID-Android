package com.helpid.app.utils

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.core.content.FileProvider
import com.helpid.app.data.UserProfile
import java.io.File

object ShareUtils {
    
    fun shareEmergencyInfo(context: Context, profile: UserProfile) {
        // Create shareable text
        val shareText = buildShareText(profile)
        
        val intent = Intent().apply {
            action = Intent.ACTION_SEND
            putExtra(Intent.EXTRA_TEXT, shareText)
            type = "text/plain"
        }
        
        context.startActivity(Intent.createChooser(intent, "Share Emergency Information"))
    }
    
    fun sharePDFFile(context: Context, pdfFile: File) {
        try {
            val uri: Uri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                pdfFile
            )
            
            val intent = Intent().apply {
                action = Intent.ACTION_SEND
                putExtra(Intent.EXTRA_STREAM, uri)
                type = "application/pdf"
            }
            
            context.startActivity(Intent.createChooser(intent, "Share Emergency Profile PDF"))
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
    
    fun shareViaWhatsApp(context: Context, profile: UserProfile) {
        val shareText = buildShareText(profile)
        
        val intent = Intent().apply {
            action = Intent.ACTION_SEND
            putExtra(Intent.EXTRA_TEXT, shareText)
            type = "text/plain"
            setPackage("com.whatsapp")
        }
        
        try {
            context.startActivity(intent)
        } catch (e: Exception) {
            // WhatsApp not installed
            context.startActivity(
                Intent(Intent.ACTION_VIEW).apply {
                    data = Uri.parse("https://wa.me/?text=${Uri.encode(shareText)}")
                }
            )
        }
    }
    
    fun shareViaSMS(context: Context, profile: UserProfile) {
        val shareText = buildShareText(profile)
        
        val intent = Intent().apply {
            action = Intent.ACTION_SENDTO
            data = Uri.parse("smsto:")
            putExtra("sms_body", shareText)
        }
        
        context.startActivity(intent)
    }
    
    fun shareViaEmail(context: Context, profile: UserProfile) {
        val shareText = buildShareText(profile)
        
        val intent = Intent().apply {
            action = Intent.ACTION_SEND
            putExtra(Intent.EXTRA_SUBJECT, "My Emergency Medical Information")
            putExtra(Intent.EXTRA_TEXT, shareText)
            type = "message/rfc822"
        }
        
        context.startActivity(intent)
    }
    
    private fun buildShareText(profile: UserProfile): String {
        val sb = StringBuilder()
        
        sb.append("🏥 EMERGENCY MEDICAL PROFILE\n\n")
        sb.append("Name: ${profile.name}\n")
        sb.append("Blood Group: ${profile.bloodGroup}\n")
        sb.append("Emergency ID: ${profile.userId}\n\n")
        
        if (profile.allergies.isNotEmpty()) {
            sb.append("⚠️ ALLERGIES:\n")
            profile.allergies.forEach { allergy ->
                sb.append("• ${allergy.allergen} (${allergy.severity})")
                if (allergy.reaction.isNotEmpty()) {
                    sb.append(" - Reaction: ${allergy.reaction}")
                }
                sb.append("\n")
            }
            sb.append("\n")
        }
        
        if (profile.medications.isNotEmpty()) {
            sb.append("💊 MEDICATIONS:\n")
            profile.medications.forEach { med ->
                sb.append("• ${med.name}: ${med.dosage} (${med.frequency})\n")
            }
            sb.append("\n")
        }
        
        if (profile.medicalNotes.isNotEmpty()) {
            sb.append("📋 CONDITIONS:\n")
            profile.medicalNotes.forEach { note ->
                sb.append("• $note\n")
            }
            sb.append("\n")
        }
        
        if (profile.emergencyContacts.isNotEmpty()) {
            sb.append("📞 EMERGENCY CONTACTS:\n")
            profile.emergencyContacts.forEach { contact ->
                sb.append("• ${contact.name}: ${contact.phone}\n")
            }
        }
        
        return sb.toString()
    }
}
