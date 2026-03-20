package re.phiphi.android.ui.navigation

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import re.phiphi.android.feature.archive.ArchiveScreen
import re.phiphi.android.feature.home.HomeRoute
import re.phiphi.android.feature.post.PostScreen
import re.phiphi.android.feature.settings.SettingsScreen

private const val SAMPLE_SLUG = "alibaba-cloud-oss-cdn-deployment"

@Composable
fun PhiphiNavHost(
    navController: NavHostController = rememberNavController(),
    contentPadding: PaddingValues = PaddingValues(),
) {
    NavHost(
        navController = navController,
        startDestination = AppRoutes.HOME,
        modifier = Modifier.padding(contentPadding),
    ) {
        composable(route = AppRoutes.HOME) {
            HomeRoute(
                onOpenArchive = { navController.navigate(TopLevelDestination.Archive.route) },
                onOpenPost = { slug -> navController.navigate(AppRoutes.post(slug)) },
            )
        }

        composable(route = AppRoutes.ARCHIVE) {
            ArchiveScreen(onOpenPost = { navController.navigate(AppRoutes.post(SAMPLE_SLUG)) })
        }

        composable(route = AppRoutes.SETTINGS) { SettingsScreen() }

        composable(
            route = AppRoutes.POST_PATTERN,
            arguments = listOf(navArgument(name = "slug") { type = NavType.StringType }),
        ) { backStackEntry ->
            PostScreen(slug = backStackEntry.arguments?.getString("slug").orEmpty())
        }
    }
}
