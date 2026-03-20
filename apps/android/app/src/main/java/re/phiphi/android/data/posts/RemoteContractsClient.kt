package re.phiphi.android.data.posts

import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import re.phiphi.android.core.model.AppManifest
import re.phiphi.android.core.model.PostDetail
import re.phiphi.android.core.model.PostsIndex

private const val SITE_ORIGIN = "https://normco.re"
private const val APP_MANIFEST_API_PATH = "/api/app-manifest.json"
private const val CONNECT_TIMEOUT_MILLIS = 10_000
private const val READ_TIMEOUT_MILLIS = 10_000
private const val HTTP_SUCCESS_MIN = 200
private const val HTTP_SUCCESS_MAX = 299

@Singleton
class RemoteContractsClient @Inject constructor(private val json: Json) {
    suspend fun fetchAppManifest(): AppManifest = fetchDocument(path = APP_MANIFEST_API_PATH)

    suspend fun fetchPostsIndex(apiUrl: String): PostsIndex = fetchDocument(path = apiUrl)

    suspend fun fetchPostDetail(apiUrl: String): PostDetail = fetchDocument(path = apiUrl)

    private suspend inline fun <reified T> fetchDocument(path: String): T =
        withContext(Dispatchers.IO) { json.decodeFromString(readText(url = resolveApiUrl(path))) }

    private fun resolveApiUrl(path: String): String =
        if (path.startsWith(prefix = "http://") || path.startsWith(prefix = "https://")) {
            path
        } else {
            "$SITE_ORIGIN${if (path.startsWith(prefix = "/")) path else "/$path"}"
        }

    private fun readText(url: String): String {
        val connection =
            (URL(url).openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                connectTimeout = CONNECT_TIMEOUT_MILLIS
                readTimeout = READ_TIMEOUT_MILLIS
                setRequestProperty("Accept", "application/json")
            }

        return try {
            val statusCode = connection.responseCode
            if (statusCode !in HTTP_SUCCESS_MIN..HTTP_SUCCESS_MAX) {
                val message =
                    connection.errorStream
                        ?.bufferedReader()
                        ?.use { reader -> reader.readText() }
                        ?.ifBlank { null }
                throw IOException("HTTP $statusCode for $url${message?.let { ": $it" } ?: ""}")
            }

            connection.inputStream.bufferedReader().use { reader -> reader.readText() }
        } finally {
            connection.disconnect()
        }
    }
}
