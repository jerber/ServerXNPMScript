#! /usr/bin/env node
const pkg = require("../package.json");

const fs = require("fs");
const shell = require("shelljs");
const process = require("process");
const rimraf = require("rimraf");
const argv = require("yargs").argv;

SERVERX_DIR = "serverx";

let res = "";

console.log("run-serverx version", pkg.version);

// first, see if you are in the server dir... if you are, get out
const dirs = process.cwd().split("/");
const curr_dir = dirs[dirs.length - 1];

if (curr_dir === SERVERX_DIR) {
  if (
    fs.existsSync(".git") &&
    fs.existsSync("venv") &&
    fs.existsSync("update.py")
  ) {
    console.log("changing dirs...");
    process.chdir(`..`);
  }
}

// if dir serverx exists and running git fetch dry run in it produces nothing, just skip to runing the server
if (fs.existsSync(SERVERX_DIR)) {
  let { stdout, stderr } = shell.exec(
    `cd ${SERVERX_DIR} && git fetch --dry-run`
  );
  if (!stdout && !stderr) {
    // make sure there is a venv
    if (fs.existsSync(`${SERVERX_DIR}/venv`)) {
      process.chdir(`${SERVERX_DIR}`);
      shell.exec("source venv/bin/activate && ./serverx");
      return;
    }
  }
}

rimraf.sync(SERVERX_DIR);
res = shell.exec(
  `git clone https://github.com/jerber/scratch.git ${SERVERX_DIR}`
);

process.chdir(`${SERVERX_DIR}`);

// shell.exec('rm -rf .git');
// shell.exec('rd /s /q .git'); // make sure this is for windows

SERVERX_API_KEY = argv.SERVERX_API_KEY;
SERVERX_PROJECT_ID = argv.SERVERX_PROJECT_ID;

fs.writeFileSync(
  `.env`,
  `SERVERX_API_KEY=${SERVERX_API_KEY}\nSERVERX_PROJECT_ID=${SERVERX_PROJECT_ID}\nFLASK_DEBUG=1\n`
);

res = shell.exec(
  "python3 -m venv venv && source venv/bin/activate && pip install --upgrade pip && pip install --upgrade setuptools && pip install -r requirements.txt && ./serverx"
);
