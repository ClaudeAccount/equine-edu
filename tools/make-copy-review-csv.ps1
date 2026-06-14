param(
  [string]$FolderPath,
  [string]$OutputPath
)

$ErrorActionPreference = "Stop"

function Read-InputPath {
  param([string]$Prompt)
  $value = Read-Host $Prompt
  return $value.Trim('"').Trim()
}

if ([string]::IsNullOrWhiteSpace($FolderPath)) {
  $FolderPath = Read-InputPath "Paste the course folder path"
}

$resolvedFolder = Resolve-Path -LiteralPath $FolderPath
if (-not (Test-Path -LiteralPath $resolvedFolder -PathType Container)) {
  throw "Folder not found: $FolderPath"
}

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
  $OutputPath = Join-Path -Path $resolvedFolder -ChildPath "copy-review.csv"
}

$root = (Get-Item -LiteralPath $resolvedFolder).FullName

function ConvertTo-PlainText {
  param([string]$Html)
  if ([string]::IsNullOrWhiteSpace($Html)) { return "" }
  $text = $Html -replace '<script[\s\S]*?</script>', ' '
  $text = $text -replace '<style[\s\S]*?</style>', ' '
  $text = $text -replace '<[^>]+>', ' '
  $text = [System.Net.WebUtility]::HtmlDecode($text)
  $text = $text -replace '\s+', ' '
  return $text.Trim()
}

function Add-Row {
  param(
    [System.Collections.Generic.List[object]]$Rows,
    [string]$File,
    [string]$Type,
    [string]$Context,
    [string]$Current
  )
  $clean = ($Current -replace '\s+', ' ').Trim()
  if ($clean.Length -lt 2) { return }
  if ($clean -match '^\d+$') { return }
  if ($clean -match '^[\W_]+$') { return }

  $Rows.Add([pscustomobject]@{
    File = $File
    Type = $Type
    Context = $Context
    CurrentCopy = $clean
    RequestedReplacement = ""
    NotesForCodex = ""
  })
}

$rows = [System.Collections.Generic.List[object]]::new()
$files = Get-ChildItem -LiteralPath $resolvedFolder -Recurse -File |
  Where-Object { $_.Extension -match '^\.html?$|^\.js$' }

foreach ($file in $files) {
  $relative = $file.FullName.Substring($root.Length).TrimStart('\') -replace '\\', '/'
  $content = Get-Content -LiteralPath $file.FullName -Raw

  if ($file.Extension -match '^\.html?$') {
    foreach ($m in [regex]::Matches($content, '<title[^>]*>([\s\S]*?)</title>', 'IgnoreCase')) {
      Add-Row $rows $relative "meta" "Document title" (ConvertTo-PlainText $m.Groups[1].Value)
    }

    foreach ($m in [regex]::Matches($content, '<meta[^>]+name=["'']description["''][^>]+content=["'']([^"'']+)["''][^>]*>', 'IgnoreCase')) {
      Add-Row $rows $relative "meta" "Meta description" ([System.Net.WebUtility]::HtmlDecode($m.Groups[1].Value))
    }

    foreach ($m in [regex]::Matches($content, '<img[^>]+alt=["'']([^"'']+)["''][^>]*>', 'IgnoreCase')) {
      Add-Row $rows $relative "meta" "Image alt text" ([System.Net.WebUtility]::HtmlDecode($m.Groups[1].Value))
    }

    foreach ($m in [regex]::Matches($content, '<(h1|h2|h3|h4|h5|h6|p|li|a|button|span|figcaption|label)\b[^>]*>([\s\S]*?)</\1>', 'IgnoreCase')) {
      $tag = $m.Groups[1].Value.ToLowerInvariant()
      $type = switch -Regex ($tag) {
        '^h[1-6]$' { "heading"; break }
        '^(a|button)$' { "button"; break }
        '^li$' { "list"; break }
        default { "paragraph" }
      }
      Add-Row $rows $relative $type $tag (ConvertTo-PlainText $m.Groups[2].Value)
    }
  }

  # Quiz fields (HTML and JS)
  foreach ($m in [regex]::Matches($content, '(prompt|answer|correct|incorrect)\s*:\s*["'']((?:\\.|[^"''])*)["'']', 'IgnoreCase')) {
    $value = $m.Groups[2].Value -replace "\\'", "'" -replace '\\"', '"' -replace '\\n', ' '
    Add-Row $rows $relative "quiz" ("Quiz " + $m.Groups[1].Value) $value
  }

  # Course config / module bar fields (title, desc, label, type, navCta label, etc.)
  foreach ($m in [regex]::Matches($content, '(?<!\w)(title|desc|description|label|type|heading|subheading|intro)\s*:\s*["'']((?:\\.|[^"''])*)["'']', 'IgnoreCase')) {
    $field = $m.Groups[1].Value.ToLowerInvariant()
    $value = $m.Groups[2].Value -replace "\\'", "'" -replace '\\"', '"' -replace '\\n', ' '
    Add-Row $rows $relative "config" ("JS $field") $value
  }

  # navCta / navExtras labels (window.LAYOUT = { navCta: { label: '...' } })
  foreach ($m in [regex]::Matches($content, 'label\s*:\s*["'']((?:\\.|[^"''])*)["'']', 'IgnoreCase')) {
    $value = $m.Groups[1].Value -replace "\\'", "'" -replace '\\"', '"'
    Add-Row $rows $relative "config" "JS nav label" $value
  }
}

$rows |
  Sort-Object File, Type, Context, CurrentCopy -Unique |
  Export-Csv -LiteralPath $OutputPath -NoTypeInformation -Encoding UTF8

Write-Host ""
Write-Host "Copy review CSV created:" -ForegroundColor Green
Write-Host $OutputPath
Write-Host ""
Write-Host "Open it in Excel or Google Sheets, fill in RequestedReplacement and NotesForCodex, then send the CSV to Codex."
