package re.phiphi.android.data.posts

import android.content.res.AssetManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import re.phiphi.android.core.model.AppManifest
import re.phiphi.android.core.model.PostSummary
import re.phiphi.android.core.model.PostsIndex
import re.phiphi.android.core.model.PostsIndexPointer
import re.phiphi.android.core.model.RemoteImage

class AssetPostsRepository(private val assetManager: AssetManager) : PostsRepository {
    override suspend fun getDefaultPostsIndex(): PostsIndex =
        withContext(Dispatchers.IO) {
            val manifest = parseAppManifest(readAsset(path = "bootstrap/app-manifest.json"))
            val defaultPointer =
                manifest.postsIndex.firstOrNull { pointer ->
                    pointer.lang == manifest.defaultLanguage
                }
                    ?: error(
                        "Missing posts-index pointer for default language '${manifest.defaultLanguage}'"
                    )

            parsePostsIndex(readAsset(path = assetPathForLang(lang = defaultPointer.lang)))
        }

    private fun assetPathForLang(lang: String): String = "bootstrap/posts-index-$lang.json"

    private fun readAsset(path: String): String =
        assetManager.open(path).bufferedReader().use { reader -> reader.readText() }

    private fun parseAppManifest(json: String): AppManifest {
        val root = JSONObject(json)
        return AppManifest(
            version = root.getString("version"),
            generatedAt = root.getString("generatedAt"),
            defaultLanguage = root.getString("defaultLanguage"),
            languages = root.getJSONArray("languages").toStringList(),
            postsIndex = root.getJSONArray("postsIndex").toPostsIndexPointers(),
        )
    }

    private fun parsePostsIndex(json: String): PostsIndex {
        val root = JSONObject(json)
        return PostsIndex(
            version = root.getString("version"),
            lang = root.getString("lang"),
            items = root.getJSONArray("items").toPostSummaries(),
        )
    }

    private fun JSONArray.toStringList(): List<String> =
        List(length()) { index -> getString(index) }

    private fun JSONArray.toPostsIndexPointers(): List<PostsIndexPointer> =
        List(length()) { index ->
            val item = getJSONObject(index)
            PostsIndexPointer(lang = item.getString("lang"), apiUrl = item.getString("apiUrl"))
        }

    private fun JSONArray.toPostSummaries(): List<PostSummary> =
        List(length()) { index ->
            val item = getJSONObject(index)
            PostSummary(
                id = item.getString("id"),
                slug = item.getString("slug"),
                title = item.getString("title"),
                summary = item.getString("summary"),
                publishedAt = item.getString("publishedAt"),
                updatedAt = item.optString("updatedAt", "").ifBlank { null },
                readingTimeMinutes = item.optInt("readingTime").takeIf { value -> value > 0 },
                tags = item.optJSONArray("tags")?.toStringList().orEmpty(),
                heroImage = item.optJSONObject("heroImage")?.toRemoteImage(),
                detailApiUrl = item.getString("detailApiUrl"),
                webUrl = item.getString("webUrl"),
            )
        }

    private fun JSONObject.toRemoteImage(): RemoteImage =
        RemoteImage(
            url = getString("url"),
            alt = getString("alt"),
            width = optInt("width").takeIf { value -> value > 0 },
            height = optInt("height").takeIf { value -> value > 0 },
        )
}
