package re.normco.android.ui

import androidx.compose.material3.Icon
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.res.stringResource
import androidx.navigation.NavDestination
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import re.normco.android.R
import re.normco.android.ui.navigation.NormcoNavHost
import re.normco.android.ui.navigation.TopLevelDestination

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NormcoApp() {
  val navController = rememberNavController()
  val backStackEntry by navController.currentBackStackEntryAsState()
  val currentDestination = backStackEntry?.destination

  Scaffold(
    topBar = {
      TopAppBar(
        title = { Text(text = stringResource(id = R.string.app_name)) },
      )
    },
    bottomBar = {
      NavigationBar {
        TopLevelDestination.entries.forEach { destination ->
          NavigationBarItem(
            selected = currentDestination.isTopLevelDestinationInHierarchy(destination),
            onClick = {
              navController.navigate(destination.route) {
                popUpTo(navController.graph.findStartDestination().id) {
                  saveState = true
                }
                launchSingleTop = true
                restoreState = true
              }
            },
            icon = {
              Icon(
                imageVector = destination.icon,
                contentDescription = null,
              )
            },
            label = {
              Text(text = stringResource(id = destination.labelRes))
            },
          )
        }
      }
    },
  ) { innerPadding ->
    NormcoNavHost(
      navController = navController,
      contentPadding = innerPadding,
    )
  }
}

private fun NavDestination?.isTopLevelDestinationInHierarchy(
  destination: TopLevelDestination,
): Boolean = this?.hierarchy?.any { navDestination ->
  navDestination.route == destination.route
} == true
