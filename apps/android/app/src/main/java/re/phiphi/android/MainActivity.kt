package re.phiphi.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import re.phiphi.android.ui.PhiphiApp
import re.phiphi.android.ui.theme.PhiphiTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        enableEdgeToEdge()

        setContent { PhiphiTheme { PhiphiApp() } }
    }
}
