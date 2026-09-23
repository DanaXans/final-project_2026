# Portable MySQL (MariaDB) + MongoDB inside the project.
# Docker is not needed.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$local = Join-Path $root ".local-db"
$mysqlDir = Join-Path $local "mariadb"
$mongoDir = Join-Path $local "mongodb"
$mysqlData = Join-Path $local "mysql-data2"
$mongoData = Join-Path $local "mongo-data"
$dump = Join-Path $root "dumps\orders.sql"

New-Item -ItemType Directory -Force -Path $local, $mysqlData, $mongoData | Out-Null

function Find-Exe($dir, $name) {
  return Get-ChildItem -Path $dir -Recurse -Filter $name -ErrorAction SilentlyContinue |
    Select-Object -First 1 -ExpandProperty FullName
}

function Download-Zip($url, $zipPath, $dest) {
  if (Test-Path $dest) { return }
  Write-Host "Downloading $url"
  Invoke-WebRequest -Uri $url -OutFile $zipPath
  Write-Host "Extracting $zipPath"
  Expand-Archive -Path $zipPath -DestinationPath $dest -Force
}

if (-not (Find-Exe $mysqlDir "mysqld.exe")) {
  Download-Zip "https://archive.mariadb.org/mariadb-11.4.5/winx64-packages/mariadb-11.4.5-winx64.zip" (Join-Path $local "mariadb.zip") $mysqlDir
}
if (-not (Find-Exe $mongoDir "mongod.exe")) {
  Download-Zip "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.14.zip" (Join-Path $local "mongodb.zip") $mongoDir
}

$mysqld = Find-Exe $mysqlDir "mysqld.exe"
$mysql = Find-Exe $mysqlDir "mysql.exe"
$installDb = Find-Exe $mysqlDir "mariadb-install-db.exe"
$mongod = Find-Exe $mongoDir "mongod.exe"
$ini = Join-Path $mysqlData "my.ini"

if (-not (Test-Path (Join-Path $mysqlData "mysql"))) {
  Write-Host "Init MySQL data dir"
  & $installDb --datadir=$mysqlData
}

$mysqlProc = Get-Process mysqld, mariadbd -ErrorAction SilentlyContinue
if (-not $mysqlProc) {
  Write-Host "Start MySQL on 3306"
  Start-Process -FilePath $mysqld -ArgumentList "--defaults-file=$ini","--port=3306","--bind-address=127.0.0.1" -WindowStyle Minimized
}

$mongoProc = Get-Process mongod -ErrorAction SilentlyContinue
if (-not $mongoProc) {
  Write-Host "Start MongoDB on 27017"
  Start-Process -FilePath $mongod -ArgumentList "--dbpath=$mongoData","--bind_ip=127.0.0.1","--port=27017" -WindowStyle Minimized
}

$ready = $false
for ($i = 0; $i -lt 40; $i++) {
  Start-Sleep -Seconds 2
  & $mysql --protocol=tcp -h 127.0.0.1 -P 3306 -u root --ssl=0 -e "SELECT 1;" 2>$null
  $mysqlReady = ($LASTEXITCODE -eq 0)
  $mongoReady = [bool](Get-Process mongod -ErrorAction SilentlyContinue)
  if ($mysqlReady -and $mongoReady) {
    $ready = $true
    break
  }
  Write-Host "waiting for databases... $($i + 1)"
}

if (-not $ready) {
  throw "Databases did not start. Check if ports 3306/27017 are free."
}

& $mysql --protocol=tcp -h 127.0.0.1 -P 3306 -u root --ssl=0 -e "CREATE DATABASE IF NOT EXISTS crm_school;"
$hasOrders = & $mysql --protocol=tcp -h 127.0.0.1 -P 3306 -u root --ssl=0 -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='crm_school' AND table_name='orders';"
if ([int]$hasOrders -eq 0) {
  Write-Host "Import orders dump"
  cmd /c "`"$mysql`" --protocol=tcp -h 127.0.0.1 -P 3306 -u root --ssl=0 crm_school < `"$dump`""
}

Write-Host "OK. MySQL :3306  Mongo :27017  db=crm_school"
Write-Host "Now run:  cd backend; npm run start:dev"
