package re.phiphi.android.data.posts

internal const val APP_MANIFEST_ASSET_PATH = "bootstrap/app-manifest.json"

internal fun postsIndexAssetPath(lang: String): String = "bootstrap/posts-index-$lang.json"

internal fun postDetailAssetPath(lang: String, slug: String): String =
    "bootstrap/post-details/$lang/$slug.json"
