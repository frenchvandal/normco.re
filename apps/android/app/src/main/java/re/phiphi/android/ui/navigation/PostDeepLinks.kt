package re.phiphi.android.ui.navigation

private val POST_DEEP_LINK_HOSTS = listOf("normco.re", "www.normco.re")

private val POST_DEEP_LINK_PATH_PREFIXES =
    listOf("/posts/", "/fr/posts/", "/zh-hans/posts/", "/zh-hant/posts/")

// Keep runtime deep-link patterns aligned with the manifest app-link paths.
object PostDeepLinks {
    val uriPatterns: List<String> =
        POST_DEEP_LINK_HOSTS.flatMap { host ->
            POST_DEEP_LINK_PATH_PREFIXES.flatMap { pathPrefix ->
                listOf("https://$host${pathPrefix}{slug}", "https://$host${pathPrefix}{slug}/")
            }
        }
}
