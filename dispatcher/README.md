# Dispatcher configuration

This module contains the basic dispatcher configurations. The configuration gets bundled in a ZIP file,
and can be downloaded and unzipped to a local folder for development.

## File Structure

```
./
├── conf.d
│   ├── available_vhosts
│   │   └── default.vhost
│   ├── dispatcher_vhost.conf
│   ├── enabled_vhosts
│   │   ├── README
│   │   └── default.vhost -> ../available_vhosts/default.vhost
│   └── rewrites
│   │   ├── default_rewrite.rules
│   │   └── rewrite.rules
│   └── variables
│       └── custom.vars
└── conf.dispatcher.d
    ├── available_farms
    │   └── default.farm
    ├── cache
    │   ├── default_invalidate.any
    │   ├── default_rules.any
    │   └── rules.any
    ├── clientheaders
    │   ├── clientheaders.any
    │   └── default_clientheaders.any
    ├── dispatcher.any
    ├── enabled_farms
    │   ├── README
    │   └── default.farm -> ../available_farms/default.farm
    ├── filters
    │   ├── default_filters.any
    │   └── filters.any
    ├── renders
    │   └── default_renders.any
    └── virtualhosts
        ├── default_virtualhosts.any
        └── virtualhosts.any
```

## Files Explained

- `conf.d/available_vhosts/default.vhost`
  - `*.vhost` (Virtual Host) files are included from inside the `dispatcher_vhost.conf`. These are `<VirtualHosts>` entries to match host names and allow Apache to handle each domain traffic with different rules. From the `*.vhost` file, other files like rewrites, white listing, etc. will be included. The `available_vhosts` directory is where the `*.vhost` files are stored and `enabled_vhosts` directory is where you enable Virtual Hosts by using a symbolic link from a file in the `available_vhosts` to the `enabled_vhosts` directory.

- `conf.d/rewrites/rewrite.rules`
  - `rewrite.rules` file is included from inside the `conf.d/enabled_vhosts/*.vhost` files. It has a set of rewrite rules for `mod_rewrite`.

- `conf.d/variables/custom.vars`
  - `custom.vars` file is included from inside the `conf.d/enabled_vhosts/*.vhost` files. You can put your Apache variables in there.

- `conf.dispatcher.d/available_farms/<CUSTOMER_CHOICE>.farm`
  - `*.farm` files are included inside the `conf.dispatcher.d/dispatcher.any` file. These parent farm files exist to control module behavior for each render or website type. Files are created in the `available_farms` directory and enabled with a symbolic link into the `enabled_farms` directory. 

- `conf.dispatcher.d/filters/filters.any`
  - `filters.any` file is included from inside the `conf.dispatcher.d/enabled_farms/*.farm` files. It has a set of rules change what traffic should be filtered out and not make it to the backend.

- `conf.dispatcher.d/virtualhosts/virtualhosts.any`
  - `virtualhosts.any` file is included from inside the `conf.dispatcher.d/enabled_farms/*.farm` files. It has a list of host names or URI paths to be matched by blob matching to determine which backend to use to serve that request.

- `conf.dispatcher.d/cache/rules.any`
  - `rules.any` file is included from inside the `conf.dispatcher.d/enabled_farms/*.farm` files. It specifies caching preferences.

- `conf.dispatcher.d/clientheaders.any`
  - `clientheaders.any` file is included inside the `conf.dispatcher.d/enabled_farms/*.farm` files. It specifies which client headers should be passed through to each renderer.

## Environment Variables

- `CONTENT_FOLDER_NAME`
  - This is the customer's content folder in the repository. This is used in the `customer_rewrite.rules` to map shortened URLs to their correct repository path.  

## Immutable Configuration Files

Some files are immutable, meaning they cannot be altered or deleted.  These are part of the base framework and enforce standards and best practices.  When customization is needed, copies of immutable files (i.e. `default.vhost` -> `publish.vhost`) can be used to modify the behavior.  Where possible, be sure to retain includes of immutable files unless customization of included files is also needed.

### Immutable Files

```
conf.d/available_vhosts/default.vhost
conf.d/dispatcher_vhost.conf
conf.d/rewrites/default_rewrite.rules
conf.dispatcher.d/available_farms/default.farm
conf.dispatcher.d/cache/default_invalidate.any
conf.dispatcher.d/cache/default_rules.any
conf.dispatcher.d/clientheaders/default_clientheaders.any
conf.dispatcher.d/dispatcher.any
conf.dispatcher.d/enabled_farms/default.farm
conf.dispatcher.d/filters/default_filters.any
conf.dispatcher.d/renders/default_renders.any
conf.dispatcher.d/virtualhosts/default_virtualhosts.any
```


##Executar local

1 - Configurar Windows e Rancher
2 - Configurar

### Windows
Arquivo **docker_run.cmd**: Encontre os ifs de **clientheaders_any**, **rewrite_rules** e **virtualhosts_any** abaixo e faça os ajustes para incluir os volumes dos client headers, das regras de rewrites e virtual hosts do projeto. Atenção para não duplicar os ifs de clientheaders_any, rewrite_rules e virtualhosts_any.

 if %%x equ wknd_clientheaders_any (
    set "volumes=-v %folder%\%%x:%dispatcher_dir%/clientheaders/wknd_clientheaders.any:ro !volumes!"
 )
 if %%x equ clientheaders_any (
    set "volumes=-v %folder%\%%x:%dispatcher_dir%/clientheaders/clientheaders.any:ro !volumes!"
 )

 if %%x equ wknd_rewrite_rules (
    set "volumes=-v %folder%\%%x:%httpd_dir%/rewrites/wknd_rewrite.rules:ro !volumes!"
 )

 if %%x equ rewrite_rules (
    set "volumes=-v %folder%\%%x:%httpd_dir%/rewrites/rewrite.rules:ro !volumes!"
 )

if %%x equ wknd_virtualhosts_any (
    set "volumes=-v %folder%\%%x:%dispatcher_dir%/virtualhosts/wknd_virtualhosts.any:ro !volumes!"
)

 if %%x equ virtualhosts_any (
    set "volumes=-v %folder%\%%x:%dispatcher_dir%/virtualhosts/virtualhosts.any:ro !volumes!"
)           

Ainda no arquivo **docker_run.cmd**: Ajuste o for, que está logo acima dos ifs ajustados, de 9 para 18:
```
    rem Loop through max possible file count in values.csv
    for /l %%g in (1,1,18) do (
```

Por padrão, o script dispatcher do windows não abre o diretório de cache para fora do container. Para isso, encontre a linha de inicialização da variável volumes e faça o seguinte ajuste:
```
set volumes=-v %folder%\..\cache:/mnt/var/www
```

### Linux
Arquivo **docker_run.sh**: Encontre a linha do "**case ${file} in**" e faça os ajustes para incluir os volumes das regras de clientheaders, rewrites e virtual hosts do projeto nos statements do case. Atenção para não duplicar os ifs de clientheaders_any, rewrite_rules e virtualhosts_any.

```

          wknd_clientheaders_any)
            volumes="-v ${folder}/${file}:${dispatcher_dir}/clientheaders/wknd_clientheaders.any:ro ${volumes}"
            ;;

          clientheaders_any)
            volumes="-v ${folder}/${file}:${dispatcher_dir}/clientheaders/clientheaders.any:ro ${volumes}"
          ;;  

          wknd_rewrite_rules)
            volumes="-v ${folder}/${file}:${httpd_dir}/rewrites/wknd_rewrite.rules:ro ${volumes}"
            ;;

          rewrite_rules)
            volumes="-v ${folder}/${file}:${httpd_dir}/rewrites/rewrite.rules:ro ${volumes}"
            ;;  

          wknd_virtualhosts_any)
            volumes="-v ${folder}/${file}:${dispatcher_dir}/virtualhosts/wknd_virtualhosts.any:ro ${volumes}"  
            ;;  

          virtualhosts_any)
            volumes="-v ${folder}/${file}:${dispatcher_dir}/virtualhosts/virtualhosts.any:ro ${volumes}"  
            ;;  

## Alterações no arquivo de hosts
Altere o arquivo de hosts da sua máquina para fazer testes localmente com o dispatcher, inclua as linhas abaixo:
```
127.0.0.1 wknd.sample.local
127.0.0.1 spa.sample.local
```
### Windows
```
C:\Windows\System32\drivers\etc\hosts
```

### Linux
```
/etc/hosts

4 - Executar
4.1 - Executar a instância do AEM Publish
4.2 - Abrir Power Shell do Windows como Adminstrador e acesse a pasta **cd ~\apache-dispatcher-wknd\dispatcher**. Depois executar no power shell, o arquivo **make_symlinks.ps1**
4.2 - Abrir Prompt de Comando do Windows como Adminstrador, execute o comando ipconfig e pegue o IPV4 do Windows. Em seguida, declare a variável **set DISPATCHER_TOOLS_AEMHOST=host.docker.internal:4503**. Exemplo: **set DISPATCHER_TOOLS_AEMHOST=192.1.1.1:4503** Por fim, no mesmo prompt de comando execute: **node run_dispatcher_local_rancher.js**

**cmd** windows:
```
set DISPATCHER_TOOLS_BIN_FOLDER=/aem-sdk/dispatcher/bin
set DISPATCHER_TOOLS_AEMHOST=host.docker.internal:4503
set DISPATCHER_TOOLS_PORT=80
```
set DISPATCHER_TOOLS_AEMHOST= 192.168.100.38:4503

**powershell** windows:
```
$env:DISPATCHER_TOOLS_BIN_FOLDER='/aem-sdk/dispatcher/bin'
$env:DISPATCHER_TOOLS_AEMHOST='host.docker.internal:4503'
$env:DISPATCHER_TOOLS_PORT=80
```

**git bash** windows:
```
export DISPATCHER_TOOLS_BIN_FOLDER=/aem-sdk/dispatcher/bin
export DISPATCHER_TOOLS_AEMHOST=host.docker.internal:4503
export DISPATCHER_TOOLS_PORT=80
```

**wsl** windows / **linux**:
```
export DISPATCHER_TOOLS_BIN_FOLDER=/mnt/c/aem-sdk/dispatcher-linux/dispatcher-sdk-2.0.184/bin
export DISPATCHER_TOOLS_AEMHOST=host.docker.internal:4503
 export DISPATCHER_TOOLS_AEMHOST=192.168.100.38:4503
export DISPATCHER_TOOLS_PORT=80
```

Comandos do linux
sudo systemctl start docker
sudo systemctl enable docker
sudo systemctl restart docker


## Troubleshooting
**Problema**. Ao executar no WSL, o erro abaixo foi encontrado em algumas situações:
```
node:internal/bootstrap/switches/does_own_process_state:126
    cachedCwd = rawMethods.cwd();
                           ^

Error: ENOENT: no such file or directory, uv_cwd
    at process.wrappedCwd [as cwd] (node:internal/bootstrap/switches/does_own_process_state:126:28)
    at node:path:1082:24
    at Object.resolve (node:path:1096:39)
    at resolveMainPath (node:internal/modules/run_main:19:40)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:71:24)
    at node:internal/main/run_main_module:17:47 {
  errno: -2,
  code: 'ENOENT',
  syscall: 'uv_cwd'
}
```
**Solução**. Saia do diretório e entre novamente:
```
cd ..
cd -
```

**Problema**. Ao executar o dispatcher é exibida uma mensagem de erro relacionada aos links simbólicos:
```
could not verify that symlink is a correct symlink in git (please double-check with 'git ls-files -s'): directory not found
```
**Solução**. Para resolver, execute os comandos abaixo:
```
git config core.symlinks true

git reset --hard
```
Ou, clone novamente com a configuração já habilitada:
```
git clone -c core.symlinks=true <URL>
```

**Problema**. Ao executar o dispatcher é exibida uma mensagem de erro relacionada a montagem de volumes no docker:
```
docker: Error response from daemon: failed to create shim task: OCI runtime create failed: runc create failed: unable to start container process: error during container init: error mounting "/mnt/wsl/rancher-desktop/run/docker-mounts/290e001a-8576-48d5-bcd7-908dae2646d9" to rootfs at "/etc/httpd/conf.d/variables/custom.vars": mount /mnt/wsl/rancher-desktop/run/docker-mounts/290e001a-8576-48d5-bcd7-908dae2646d9:/etc/httpd/conf.d/variables/custom.vars (via /proc/self/fd/6), flags: 0x5001: not a directory: unknown: Are you trying to mount a directory onto a file (or vice-versa)? Check if the specified host path exists and is the expected type.
```
**Solução**. Esse problema só foi identificado no WSL com o Rancher Desktop. O script dispatcher.js já está preparado para criar o diretório de cache e resolver esse problema. De qualquer forma, fica o registro para verificar se todos os arquivos e diretórios dos volumes estão devidamente criados quando for exibido erro semelhante.

**Problema**. Ao tentar acessar alguma página, após inicializar o dispatcher, é exibida uma mensagem de erro em texto simples:
```
404 page not found
```
**Solução**. Esse problema só foi identificado no WSL com o Rancher Desktop, isso porque por padrão ele faz uso das portas 80 e 443 para o ingress do k8s. Para liberar essas portas, podemos desabilitar o traefik:
* Preferences > Kubernetes > Desmarcar a opção "Enable Traefik"

Ou, alternativamente, você pode alterar a variável de ambiente DISPATCHER_TOOLS_PORT de 80 para 8080. No entanto, para essa alternativa, é preciso ajustar no arquivo *_virtualhosts.any do seu projeto para ter uma entrada com a porta, ex: "${WKND_LOCAL_PUBLISH_DNS}:8080"

Verifique, também, nas preferências do Rancher se as opções abaixo estão habilitadas:
1. Preferences > WSL > Network > Marcar a opção "Enable networking tunnel"
1. Preferences > WSL > Integrations > Marcar a opção "Ubuntu-20.04" (onde "Ubuntu-20.04" corresponde a sua distribuição WSL)
