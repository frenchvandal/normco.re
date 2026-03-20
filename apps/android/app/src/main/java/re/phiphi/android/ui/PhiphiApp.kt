package re.phiphi.android.ui

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.res.stringResource
import androidx.navigation.NavDestination
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import re.phiphi.android.R
import re.phiphi.android.ui.navigation.AppRoutes
import re.phiphi.android.ui.navigation.PhiphiNavHost
import re.phiphi.android.ui.navigation.TopLevelDestination

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PhiphiApp() {
    val navController = rememberNavController()
    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = backStackEntry?.destination
    val currentTopLevelDestination =
        TopLevelDestination.entries.firstOrNull { destination ->
            currentDestination.isTopLevelDestinationInHierarchy(destination)
        }
    val showBottomBar = currentTopLevelDestination != null
    val topBarTitleRes =
        currentTopLevelDestination?.labelRes
            ?: when (currentDestination?.route) {
                AppRoutes.POST_PATTERN -> R.string.post_title
                else -> R.string.app_name
            }

    Scaffold(
        topBar = {
            PhiphiTopBar(
                titleRes = topBarTitleRes,
                showBottomBar = showBottomBar,
                canNavigateBack = navController.previousBackStackEntry != null,
                onNavigateUp = navController::navigateUp,
            )
        },
        bottomBar = {
            if (showBottomBar) {
                PhiphiBottomBar(
                    currentDestination = currentDestination,
                    onNavigateToTopLevel = { route ->
                        navController.navigate(route) {
                            popUpTo(navController.graph.findStartDestination().id) {
                                saveState = true
                            }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                )
            }
        },
    ) { innerPadding ->
        PhiphiNavHost(navController = navController, contentPadding = innerPadding)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun PhiphiTopBar(
    titleRes: Int,
    showBottomBar: Boolean,
    canNavigateBack: Boolean,
    onNavigateUp: () -> Unit,
) {
    TopAppBar(
        title = { Text(text = stringResource(id = titleRes)) },
        navigationIcon = {
            if (!showBottomBar && canNavigateBack) {
                IconButton(onClick = onNavigateUp) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = stringResource(id = R.string.nav_back),
                    )
                }
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(),
    )
}

@Composable
private fun PhiphiBottomBar(
    currentDestination: NavDestination?,
    onNavigateToTopLevel: (String) -> Unit,
) {
    NavigationBar {
        TopLevelDestination.entries.forEach { destination ->
            NavigationBarItem(
                selected = currentDestination.isTopLevelDestinationInHierarchy(destination),
                onClick = { onNavigateToTopLevel(destination.route) },
                icon = { Icon(imageVector = destination.icon, contentDescription = null) },
                label = { Text(text = stringResource(id = destination.labelRes)) },
            )
        }
    }
}

private fun NavDestination?.isTopLevelDestinationInHierarchy(
    destination: TopLevelDestination
): Boolean =
    this?.hierarchy?.any { navDestination ->
        navDestination.route == destination.route ||
            navDestination.route?.startsWith("${destination.route}/") == true
    } == true
