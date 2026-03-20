package re.phiphi.android.ui.navigation

import androidx.annotation.StringRes
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Article
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.ui.graphics.vector.ImageVector
import re.phiphi.android.R

enum class TopLevelDestination(
    @param:StringRes val labelRes: Int,
    val route: String,
    val icon: ImageVector,
) {
    Home(labelRes = R.string.nav_home, route = AppRoutes.HOME, icon = Icons.Outlined.Home),
    Archive(
        labelRes = R.string.nav_archive,
        route = AppRoutes.ARCHIVE,
        icon = Icons.AutoMirrored.Outlined.Article,
    ),
    Settings(
        labelRes = R.string.nav_settings,
        route = AppRoutes.SETTINGS,
        icon = Icons.Outlined.Settings,
    ),
}
