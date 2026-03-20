package re.phiphi.android.data.posts

import android.content.Context
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import re.phiphi.android.core.model.AppManifest
import re.phiphi.android.core.model.PostsIndex

@Singleton
class AssetPostsRepository
@Inject
constructor(@param:ApplicationContext private val context: Context, private val json: Json) :
    PostsRepository {
    override suspend fun getDefaultPostsIndex(): PostsIndex =
        withContext(Dispatchers.IO) {
            val manifest = readDocument<AppManifest>(path = "bootstrap/app-manifest.json")
            val defaultPointer =
                manifest.postsIndex.firstOrNull { pointer ->
                    pointer.lang == manifest.defaultLanguage
                }
                    ?: error(
                        "Missing posts-index pointer for default language '${manifest.defaultLanguage}'"
                    )

            readDocument(path = assetPathForLang(lang = defaultPointer.lang))
        }

    private fun assetPathForLang(lang: String): String = "bootstrap/posts-index-$lang.json"

    private fun readAsset(path: String): String =
        context.assets.open(path).bufferedReader().use { reader -> reader.readText() }

    private inline fun <reified T> readDocument(path: String): T =
        json.decodeFromString(readAsset(path))
}
