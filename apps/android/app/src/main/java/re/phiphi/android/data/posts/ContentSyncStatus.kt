package re.phiphi.android.data.posts

data class ContentSyncStatus(
    val lastCheckedAtMillis: Long? = null,
    val lastCheckSucceeded: Boolean? = null,
)
