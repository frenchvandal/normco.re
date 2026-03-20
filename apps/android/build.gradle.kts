plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.detekt) apply false
    alias(libs.plugins.hilt) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.kotlin.serialization) apply false
    alias(libs.plugins.ksp) apply false
    alias(libs.plugins.spotless)
}

spotless {
    kotlin {
        target("app/src/**/*.kt")
        ktfmt().kotlinlangStyle()
    }

    kotlinGradle {
        target("*.gradle.kts", "app/**/*.gradle.kts")
        ktfmt().kotlinlangStyle()
    }
}

tasks.register("format") {
    group = "formatting"
    description = "Format Kotlin and Gradle Kotlin files in apps/android."
    dependsOn("spotlessApply")
}

tasks.register("quality") {
    group = "verification"
    description = "Run formatting checks, detekt, and Android lint for apps/android."
    dependsOn("spotlessCheck", ":app:detekt", ":app:lintDebug")
}
