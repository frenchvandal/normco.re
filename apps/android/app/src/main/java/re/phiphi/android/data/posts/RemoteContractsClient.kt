package re.phiphi.android.data.posts

import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import okhttp3.OkHttpClient
import okhttp3.Request
import re.phiphi.android.core.model.AppManifest
import re.phiphi.android.core.model.PostDetail
import re.phiphi.android.core.model.PostsIndex

private const val SITE_ORIGIN = "https://normco.re"
private const val APP_MANIFEST_API_PATH = "/api/app-manifest.json"

@Singleton
class RemoteContractsClient
@Inject
constructor(private val json: Json, private val okHttpClient: OkHttpClient) {
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
        val request =
            Request.Builder()
                .url(url)
                .get()
                .header(name = "Accept", value = "application/json")
                .build()

        okHttpClient.newCall(request).execute().use { response ->
            val responseBody = response.body?.string().orEmpty()

            if (!response.isSuccessful) {
                val message = responseBody.ifBlank { response.message }.ifBlank { null }
                throw IOException("HTTP ${response.code} for $url${message?.let { ": $it" } ?: ""}")
            }

            if (responseBody.isBlank()) {
                throw IOException("Empty response body for $url")
            }

            return responseBody
        }
    }
}
