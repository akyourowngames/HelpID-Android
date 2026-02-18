package com.helpid.app.utils

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.nio.charset.StandardCharsets
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

class SensitiveDataCipher {
    private val alias = "helpid_sensitive_aes"
    private val transform = "AES/GCM/NoPadding"
    private val ivSize = 12
    private val gcmTagBits = 128
    private val encryptedPrefix = "enc::"

    fun encrypt(plainText: String): String {
        if (plainText.isBlank()) return plainText
        if (plainText.startsWith(encryptedPrefix)) return plainText

        val cipher = Cipher.getInstance(transform)
        cipher.init(Cipher.ENCRYPT_MODE, getOrCreateSecretKey())
        val encrypted = cipher.doFinal(plainText.toByteArray(StandardCharsets.UTF_8))
        val payload = cipher.iv + encrypted
        return encryptedPrefix + Base64.encodeToString(payload, Base64.NO_WRAP)
    }

    fun decryptOrNull(value: String): String? {
        if (!value.startsWith(encryptedPrefix)) return null

        val raw = Base64.decode(value.removePrefix(encryptedPrefix), Base64.DEFAULT)
        if (raw.size <= ivSize) return null

        val iv = raw.copyOfRange(0, ivSize)
        val encrypted = raw.copyOfRange(ivSize, raw.size)

        val cipher = Cipher.getInstance(transform)
        cipher.init(Cipher.DECRYPT_MODE, getOrCreateSecretKey(), GCMParameterSpec(gcmTagBits, iv))
        val decrypted = cipher.doFinal(encrypted)
        return String(decrypted, StandardCharsets.UTF_8)
    }

    private fun getOrCreateSecretKey(): SecretKey {
        val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        val existing = keyStore.getKey(alias, null) as? SecretKey
        if (existing != null) return existing

        val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
        val spec = KeyGenParameterSpec.Builder(
            alias,
            KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
        )
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setRandomizedEncryptionRequired(true)
            .build()

        keyGenerator.init(spec)
        return keyGenerator.generateKey()
    }
}
