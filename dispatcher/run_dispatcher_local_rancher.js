'use strict';

const {execSync} = require('child_process');
const fs = require('fs');
var path = require('path');

const exec = (commands) => {
    console.log(commands);
    execSync(commands, {stdio: 'inherit', shell: true});
};

const copyNewFiles = () => {
    const newFiles = [
        {
            src: './src/conf.d/rewrites/wknd_rewrite.rules',
            dst: './out/wknd_rewrite_rules',
        },
        {
            src: './src/conf.d/rewrites/rewrite.rules',
            dst: './out/rewrite_rules',
        },
        
    ];
    for (var idx in newFiles)
        fs.copyFileSync(newFiles[idx]['src'], newFiles[idx]['dst']);
};

const updateValuesCsv = () => {
    var valuesCsv = fs.readFileSync('./out/values.csv').toString();
    valuesCsv = valuesCsv.replace('rewrite_rules','wknd_rewrite_rules,rewrite_rules');
    fs.writeFileSync('./out/values.csv', valuesCsv);
};

const isLinux = process.platform == 'linux';
console.log({isLinux});
var VALIDATOR_FOLDER_PATH = './dispatcher_tools_2_0_190_windows/bin/validator'
var BIN_FOLDER_PATH = './dispatcher_tools_2_0_190_windows/bin/docker_run.cmd'
var validatorPath = ''
var dispatcherToolsBinFolder = ''
if(isLinux){
    validatorPath = path.resolve('./dispatcher_tools_2_0_190_unix/bin/validator');
    dispatcherToolsBinFolder = path.resolve('./dispatcher_tools_2_0_190_unix/bin/docker_run.sh');
}else{
    validatorPath = path.resolve(VALIDATOR_FOLDER_PATH);
    dispatcherToolsBinFolder = path.resolve(BIN_FOLDER_PATH);
}

// 0. Check env
//const validatorPath = path.resolve('./dispatcher-tools/bin/validator');
//const dispatcherToolsBinFolder = path.resolve('./dispatcher-tools/bin');
var aemHost = process.env.DISPATCHER_TOOLS_AEMHOST;
var port = process.env.DISPATCHER_TOOLS_PORT;
if (!dispatcherToolsBinFolder) {
    console.log('**ERROR** Check environment variables, for example:');
    console.log('DISPATCHER_TOOLS_BIN_FOLDER=/aem-sdk/dispatcher/bin');
    console.log('DISPATCHER_TOOLS_AEMHOST=host.docker.internal:4503');
    console.log('DISPATCHER_TOOLS_PORT=80');
    process.exit(1);
}
if (!aemHost) aemHost = 'host.docker.internal:4503';
if (!port) port = '80';


// 1. limpa diretório
exec(isLinux ? `rm -rf out` : `del out /F /Q`);

// 2. executa validator do dispatcher tools
exec(`${validatorPath} full -relaxed -d out src`);

// 3. copia novos arquivos de projeto para o diretório de out
copyNewFiles();

// 4. ajusta o values.csv para incluir os novos arquivos
updateValuesCsv();

// 5. executa o docker do dispatcher tools
exec(
    `${dispatcherToolsBinFolder} out ${aemHost} ${port}`,
);
