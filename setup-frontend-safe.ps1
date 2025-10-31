$base = "C:\arjunai\apps\web"
$css = @'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: dark; }
body { @apply bg-[#0B1120] text-white antialiased; }
'@

# ensure folder exists
New-Item -ItemType Directory -Force -Path "$base\app" | Out-Null

# write the file
$css | Set-Content -Path "$base\app\globals.css" -Encoding UTF8

Write-Host "✅ globals.css created successfully"
