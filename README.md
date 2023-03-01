# Yeet Chonker experiment

## Build
```
npm install
npm run bundle
```

## Run
```
npx run http-server .

# open new terminal
node server.js
```

* Pop open a browser and head over to localhost:8080
* send `test.mov`


# Notes
* There are hacks at play. read the comments in `server.js`.
* `server.js`, `index.html`, and `node-test.js` are _all_ using the same `generateCid` function which is in `multijank.js`