# Runs Node importer (mysql2). MariaDB client cannot talk to MySQL 8 auth.

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
node .\scripts\import-orders.js
if ($LASTEXITCODE -ne 0) {
  throw "Import failed."
}
