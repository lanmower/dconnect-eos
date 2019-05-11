/*
 * To tie everything together, we must instantiate our Action Handler and Action Reader, and instantiate an Action
 * Watcher with both of those.
 */

const { BaseActionWatcher } = require("demux")
const { NodeosActionReader } = require("demux-eos") // eslint-disable-line
const ObjectActionHandler = require("./ObjectActionHandler")
const handlerVersion = require("./handle")
const url = require('./url');
/*
 * This ObjectActionHandler, which does not change the signature from its parent AbstractActionHandler, takes an array
 * of `HandlerVersion` objects
 */
const actionHandler = new ObjectActionHandler([handlerVersion])

var MongoClient = require('mongodb').MongoClient;


MongoClient.connect(url, { useNewUrlParser: true,reconnectTries: 60, reconnectInterval: 1000}, async function(err, db) {
  global.db = db;
  var dbo = db.db("dconnectlive");
  //if (await db.authenticate("myuser", "mypassword")) {
  let state = await dbo.collection("state").findOne({});
	  console.log(state);

  const actionReader = new NodeosActionReader({
        startAtBlock: (state.indexState.blockNumber|| 56900000)+1,

      onlyIrreversible: false,
      nodeosEndpoint: "https://api.eosnewyork.io"
    })

    /* BaseActionWatcher
     * This ready-to-use base class helps coordinate the Action Reader and Action Handler, passing through block information
     * from the Reader to the Handler. The third argument is the polling loop interval in milliseconds. Since EOS has 0.5s
     * block times, we set this to half that for an average of 125ms latency.
     *
     * All that is left to run everything is to call `watch()`.
     */
    const actionWatcher = new BaseActionWatcher(
      actionReader,
      actionHandler,
      3000,
    )

    actionWatcher.watch();
});

