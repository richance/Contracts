const fs = require('fs');
const path = require('path');

const artifacts_dir = path.join(__dirname, 'artifacts');
const abi_dir = path.join(__dirname, 'abi');

if (fs.existsSync(abi_dir)) {
  const files = fs.readdirSync(abi_dir);
  for (let f of files) fs.unlinkSync(path.join(abi_dir, f));
} else {
  fs.mkdirSync(abi_dir);
}

const artifacts = fs.readdirSync(artifacts_dir);
for (let artifact of artifacts) {
  const { abi } = require(path.join(artifacts_dir, artifact));
  if (!abi || abi.length == 0) continue;
  fs.writeFileSync(
    path.join(abi_dir, artifact),
    JSON.stringify(abi, null, 2)
  );
}