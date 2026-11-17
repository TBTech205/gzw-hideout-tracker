# Downloads item icons into .\icons, named by item id.
# Usage (PowerShell, from the project folder):  .\get-icons.ps1
$base = 'https://gzw-findit.xteh.xyz/images/items'
$map = [ordered]@{
  opium_gum          = 'opium-gum'
  garden_lime        = 'garden-lime'
  ammonium_chloride  = 'ammonium-chloride'
  purified_water     = 'purified-water'
  citric_acid        = 'citric-acid'
  sulfuric_acid      = 'sulfuric-acid'
  methylparaben      = 'methylparaben'
  saline             = 'saline'
  acetic_anhydride   = 'acetic-anhydride'
  sodium_carbonate   = 'sodium-carbonate'
  chloroform         = 'chloroform'
  ether              = 'ether'
  hydrochloric_acid  = 'hydrochloric-acid'
  ethyl_alcohol      = 'ethyl-alcohol'
  low_base           = 'low-quality-morphine-base'
  medium_base        = 'medium-quality-morphine-base'
  high_base          = 'high-quality-morphine-base'
  solution_10        = '10-morphine-solution'
  stabilized_sulfate = 'stabilized-morphine-sulfate-liquid'
  gray_heroin        = 'gray-heroin'
  white_heroin       = 'pure-white-heroin'
}
$dir = Join-Path $PSScriptRoot 'icons'
New-Item -ItemType Directory -Force -Path $dir | Out-Null
foreach ($id in $map.Keys) {
  $url = "$base/$($map[$id])/icon.png"
  $out = Join-Path $dir "$id.png"
  try {
    Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing -Headers @{ 'User-Agent' = 'Mozilla/5.0' }
    Write-Host "ok    $id"
  } catch {
    Write-Host "FAIL  $id  ($url)" -ForegroundColor Yellow
    if (Test-Path $out) { Remove-Item $out }
  }
}
Write-Host "Done. Restart the app to see the icons."
