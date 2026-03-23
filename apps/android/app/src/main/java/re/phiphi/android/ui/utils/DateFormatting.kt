package re.phiphi.android.ui.utils

import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter
import java.time.format.FormatStyle
import java.util.Locale

fun formatPublishedDate(dateTime: String): String =
    runCatching {
            OffsetDateTime.parse(dateTime)
                .format(
                    DateTimeFormatter.ofLocalizedDate(FormatStyle.MEDIUM)
                        .withLocale(Locale.getDefault())
                )
        }
        .getOrElse { dateTime }
