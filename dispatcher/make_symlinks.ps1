$AVAILABLE_VHOSTS_FOLDER_PATH = "./src/conf.d/available_vhosts";
$AVAILABLE_FARMS_FOLDER_PATH = "./src/conf.dispatcher.d/available_farms";
$ENABLED_HOSTS_FOLDER_PATH = "./src/conf.d/enabled_vhosts";
$ENABLED_FARMS_FOLDER_PATH = "./src/conf.dispatcher.d/enabled_farms"


$ENABLED_HOSTS = "wknd.vhost";

$ENABLED_FARMS = "wknd.farm";


Write-Output "Enabling vhosts...";

# Create a symlink for each host
foreach ($vhost in $ENABLED_HOSTS ) {
  if (Test-Path "$ENABLED_HOSTS_FOLDER_PATH/$vhost") {
    Remove-Item "$ENABLED_HOSTS_FOLDER_PATH/$vhost";
  }

  New-Item -Path "$ENABLED_HOSTS_FOLDER_PATH/$vhost" -ItemType SymbolicLink -Value "$AVAILABLE_VHOSTS_FOLDER_PATH/$vhost"
}

# Create a symlink for each farm
foreach ($farm in $ENABLED_FARMS ) {
  if (Test-Path "$ENABLED_FARMS_FOLDER_PATH/$farm") {
    Remove-Item "$ENABLED_FARMS_FOLDER_PATH/$farm";
  }

  New-Item -Path "$ENABLED_FARMS_FOLDER_PATH/$farm" -ItemType SymbolicLink -Value "$AVAILABLE_FARMS_FOLDER_PATH/$farm"
}