package re.normco.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import re.normco.android.ui.NormcoApp
import re.normco.android.ui.theme.NormcoTheme

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    enableEdgeToEdge()

    setContent {
      NormcoTheme {
        NormcoApp()
      }
    }
  }
}
