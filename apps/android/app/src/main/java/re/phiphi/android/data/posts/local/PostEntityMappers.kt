package re.phiphi.android.data.posts.local

import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import re.phiphi.android.core.model.AppManifest
import re.phiphi.android.core.model.PostDetail
import re.phiphi.android.core.model.PostDetailAlternate
import re.phiphi.android.core.model.PostDetailBlock
import re.phiphi.android.core.model.PostSummary
import re.phiphi.android.core.model.PostsIndex
import re.phiphi.android.core.model.PostsIndexPointer
import re.phiphi.android.core.model.RemoteImage

fun AppManifest.toEntity(json: Json): AppManifestEntity =
    AppManifestEntity(
        version = version,
        generatedAt = generatedAt,
        defaultLanguage = defaultLanguage,
        languagesJson = json.encodeToString(languages),
        postsIndexJson = json.encodeToString(postsIndex),
    )

fun AppManifestEntity.toModel(json: Json): AppManifest =
    AppManifest(
        version = version,
        generatedAt = generatedAt,
        defaultLanguage = defaultLanguage,
        languages = json.decodeFromString<List<String>>(languagesJson),
        postsIndex = json.decodeFromString<List<PostsIndexPointer>>(postsIndexJson),
    )

fun PostEntity.toPostSummary(json: Json): PostSummary =
    PostSummary(
        id = id,
        slug = slug,
        title = title,
        summary = summary,
        publishedAt = publishedAt,
        updatedAt = updatedAt,
        readingTimeMinutes = readingTimeMinutes,
        tags = json.decodeFromString<List<String>>(tagsJson),
        heroImage = heroImageJson?.let { encoded -> json.decodeFromString<RemoteImage>(encoded) },
        detailApiUrl = detailApiUrl,
        webUrl = webUrl,
    )

fun PostEntity.toPostDetail(json: Json, version: String): PostDetail =
    PostDetail(
        version = version,
        id = id,
        slug = slug,
        lang = lang,
        title = title,
        summary = summary,
        publishedAt = publishedAt,
        updatedAt = updatedAt,
        readingTimeMinutes = readingTimeMinutes,
        tags = json.decodeFromString<List<String>>(tagsJson),
        alternates =
            alternatesJson?.let { encoded ->
                json.decodeFromString<List<PostDetailAlternate>>(encoded)
            } ?: emptyList(),
        heroImage = heroImageJson?.let { encoded -> json.decodeFromString<RemoteImage>(encoded) },
        webUrl = webUrl,
        blocks =
            blocksJson?.let { encoded -> json.decodeFromString<List<PostDetailBlock>>(encoded) }
                ?: emptyList(),
    )

fun List<PostEntity>.toPostsIndex(lang: String, version: String, json: Json): PostsIndex =
    PostsIndex(version = version, lang = lang, items = map { entity -> entity.toPostSummary(json) })
