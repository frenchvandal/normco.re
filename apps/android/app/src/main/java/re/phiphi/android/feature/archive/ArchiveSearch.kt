package re.phiphi.android.feature.archive

import java.text.Normalizer
import java.util.Locale
import re.phiphi.android.core.model.PostSummary

internal fun PostSummary.matchesArchiveQuery(query: String): Boolean {
    val normalizedQuery = query.normalizeArchiveSearch()
    if (normalizedQuery.isBlank()) {
        return true
    }

    val haystack =
        listOf(title, summary, tags.joinToString(separator = " "))
            .joinToString(separator = " ")
            .normalizeArchiveSearch()

    return normalizedQuery in haystack
}

private fun String.normalizeArchiveSearch(): String =
    Normalizer.normalize(this, Normalizer.Form.NFD)
        .replace("\\p{Mn}+".toRegex(), "")
        .lowercase(Locale.getDefault())
