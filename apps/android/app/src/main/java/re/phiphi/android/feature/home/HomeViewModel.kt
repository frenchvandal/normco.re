package re.phiphi.android.feature.home

import android.app.Application
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import re.phiphi.android.data.posts.AssetPostsRepository
import re.phiphi.android.data.posts.PostsRepository

class HomeViewModel(private val postsRepository: PostsRepository) : ViewModel() {
    private val _uiState = MutableStateFlow<HomeUiState>(HomeUiState.Loading)
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _uiState.value = HomeUiState.Loading
            _uiState.value =
                runCatching { postsRepository.getDefaultPostsIndex() }
                    .fold(
                        onSuccess = { postsIndex ->
                            HomeUiState.Success(lang = postsIndex.lang, items = postsIndex.items)
                        },
                        onFailure = { throwable ->
                            HomeUiState.Error(message = throwable.message ?: "Unknown failure")
                        },
                    )
        }
    }
}

class HomeViewModelFactory(private val application: Application) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(HomeViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return HomeViewModel(
                postsRepository = AssetPostsRepository(assetManager = application.assets)
            )
                as T
        }

        throw IllegalArgumentException("Unknown ViewModel class: ${modelClass.name}")
    }
}
