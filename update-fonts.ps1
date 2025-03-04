# Define the path to your project's SCSS files
$scssPath = "./_includes/styles"

# Update the variables.scss file to change font families
$variablesPath = "$scssPath/_variables.scss"
$variablesContent = Get-Content -Path $variablesPath -Raw

# Replace the font families
$variablesContent = $variablesContent -replace '--font-family-sans-serif: "Jost", serif;', '--font-family-sans-serif: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;'
$variablesContent = $variablesContent -replace '--font-family-calligraphy: "Knewave", serif;', '--font-family-calligraphy: "Segoe Script", "Zapfino", "Lucida Calligraphy", "Brush Script", cursive;'

# Write the changes back to the file
$variablesContent | Set-Content -Path $variablesPath

# Find all SCSS files recursively
$scssFiles = Get-ChildItem -Path $scssPath -Filter "*.scss" -Recurse

# Process each SCSS file
foreach ($file in $scssFiles) {
    Write-Host "Processing $($file.FullName)"
    $content = Get-Content -Path $file.FullName -Raw
    
    # Replace font weights
    $content = $content -replace 'font-weight: 800;', 'font-weight: 700;'
    $content = $content -replace 'font-weight: 500;', 'font-weight: 400;'
    $content = $content -replace 'font-weight: 700;', 'font-weight: 600;' # Note: This must be after the 800->700 replacement
    
    # Special case: restore h2 to 700 (it should be bold)
    $content = $content -replace 'h2 \{[^}]*font-weight: 600;', 'h2 {
    font-size: 1.75rem;
    font-weight: 700;'
    
    # Write the changes back to the file
    $content | Set-Content -Path $file.FullName
}

# Remove Google Fonts from the GlobalLayout.ts file
$layoutPath = "./_includes/layouts/GlobalLayout.ts"
$layoutContent = Get-Content -Path $layoutPath -Raw

# Remove the Google Fonts links
$layoutContent = $layoutContent -replace '<link rel="preconnect" href="https://fonts.googleapis.com" />\s*<link\s+rel="preconnect"\s+href="https://fonts.gstatic.com"\s+crossorigin="anonymous"\s+/>\s*<link\s+href="https://fonts.googleapis.com/css2\?family=Jost:ital,wght@0,100\.\.900;1,100\.\.900&family=Knewave&display=swap"\s+rel="stylesheet"\s+/>', ''

# Write the changes back to the file
$layoutContent | Set-Content -Path $layoutPath

Write-Host "All font updates completed successfully!"