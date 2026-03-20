package re.normco.android.ui.navigation

object AppRoutes {
  const val HOME = "home"
  const val ARCHIVE = "archive"
  const val SETTINGS = "settings"
  const val POST_PATTERN = "post/{slug}"
  private const val POST_PREFIX = "post"

  fun post(slug: String): String = "$POST_PREFIX/$slug"
}
