package com.helpid.app.utils

import android.content.Context
import android.os.Environment
import com.helpid.app.data.UserProfile
import com.itextpdf.text.Document
import com.itextpdf.text.Element
import com.itextpdf.text.Font
import com.itextpdf.text.Paragraph
import com.itextpdf.text.Phrase
import com.itextpdf.text.pdf.PdfPCell
import com.itextpdf.text.pdf.PdfPTable
import com.itextpdf.text.pdf.PdfWriter
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object PDFExporter {
    
    fun exportProfileToPDF(context: Context, profile: UserProfile): File? {
        return try {
            val fileName = "HelpID_${profile.userId}_${System.currentTimeMillis()}.pdf"
            val file = File(
                context.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS),
                fileName
            )
            
            val document = Document()
            PdfWriter.getInstance(document, FileOutputStream(file))
            document.open()
            
            // Title
            val title = Paragraph("EMERGENCY MEDICAL PROFILE", Font(Font.FontFamily.HELVETICA, 20f, Font.BOLD))
            title.alignment = Element.ALIGN_CENTER
            document.add(title)
            
            document.add(Paragraph("\n"))
            
            // Personal Information Section
            addSection(document, "PERSONAL INFORMATION")
            addKeyValue(document, "Name", profile.name)
            addKeyValue(document, "Blood Group", profile.bloodGroup)
            addKeyValue(document, "Emergency ID", profile.userId)
            
            document.add(Paragraph("\n"))
            
            // Medical Conditions Section
            if (profile.medicalNotes.isNotEmpty()) {
                addSection(document, "MEDICAL CONDITIONS")
                profile.medicalNotes.forEach { note ->
                    document.add(Paragraph("• $note", Font(Font.FontFamily.HELVETICA, 11f)))
                }
            }
            
            document.add(Paragraph("\n"))
            
            // Emergency Contacts Section
            if (profile.emergencyContacts.isNotEmpty()) {
                addSection(document, "EMERGENCY CONTACTS")
                profile.emergencyContacts.forEach { contact ->
                    addKeyValue(document, contact.name, contact.phone)
                }
            }
            
            document.add(Paragraph("\n\n"))
            
            // Footer
            val footer = Paragraph(
                "Generated: ${SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date())}",
                Font(Font.FontFamily.HELVETICA, 9f)
            )
            footer.alignment = Element.ALIGN_CENTER
            document.add(footer)
            
            document.close()
            file
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
    
    private fun addSection(document: Document, title: String) {
        val section = Paragraph(title, Font(Font.FontFamily.HELVETICA, 14f, Font.BOLD))
        section.spacingBefore = 10f
        document.add(section)
    }
    
    private fun addKeyValue(document: Document, key: String, value: String) {
        val table = PdfPTable(2)
        table.widthPercentage = 100f
        table.setWidths(floatArrayOf(30f, 70f))
        
        val keyCell = PdfPCell(Phrase(key, Font(Font.FontFamily.HELVETICA, 11f, Font.BOLD)))
        keyCell.border = 0
        keyCell.paddingBottom = 5f
        table.addCell(keyCell)
        
        val valueCell = PdfPCell(Phrase(value, Font(Font.FontFamily.HELVETICA, 11f)))
        valueCell.border = 0
        valueCell.paddingBottom = 5f
        table.addCell(valueCell)
        
        document.add(table)
    }
}
