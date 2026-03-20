package re.normco.android.ui.navigation

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import re.normco.android.feature.archive.ArchiveScreen
import re.normco.android.feature.home.HomeScreen
import re.normco.android.feature.post.PostScreen
import re.normco.android.feature.settings.SettingsScreen

private const val SampleSlug = "hello-android"

@Composable
fun NormcoNavHost(
  navController: androidx.navigation.NavHostController = rememberNavController(),
  contentPadding: PaddingValues = PaddingValues(),
) {
  NavHost(
    navController = navController,
    startDestination = AppRoutes.HOME,
    modifier = Modifier.padding(contentPadding),
  ) {
    composable(route = AppRoutes.HOME) {
      HomeScreen(
        onOpenArchive = {
          navController.navigate(TopLevelDestination.Archive.route)
        },
        onOpenPost = { slug ->
          navController.navigate(AppRoutes.post(slug))
        },
      )
    }

    composable(route = AppRoutes.ARCHIVE) {
      ArchiveScreen(
        onOpenPost = {
          navController.navigate(AppRoutes.post(SampleSlug))
        },
      )
    }

    composable(route = AppRoutes.SETTINGS) {
      SettingsScreen()
    }

    composable(
      route = AppRoutes.POST_PATTERN,
      arguments = listOf(
        navArgument(name = "slug") {
          type = NavType.StringType
        },
      ),
    ) { backStackEntry ->
      PostScreen(
        slug = backStackEntry.arguments?.getString("slug").orEmpty(),
      )
    }
  }
}
