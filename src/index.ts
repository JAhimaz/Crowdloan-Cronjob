import { ApiPromise, WsProvider } from '@polkadot/api'

async function checkForNewCrowdloans(): Promise<string> {
  const relayChains = {
    "polkadot": {
      "rpc": "wss://rpc.polkadot.io",
      "id": 0
    },
    "kusama": {
      "rpc": "wss://kusama-rpc.polkadot.io",
      "id": 2
    }
  }

  Object.entries(relayChains).forEach(async ([relayChain, { rpc, id }]) => {
    console.log("Checking for new crowdloans on", relayChain.toUpperCase())

    const api = await ApiPromise.create({ provider: new WsProvider(rpc), noInitWarn: true });

    const paraIds = await api.query.crowdloan.funds.keys().then(x => x.map(y => Number(y.args[0]))) ?? [];
    // convert each paraId to a string and add the relay chain id to the front
    const crowdloans = paraIds.map(paraId => `${id}-${paraId.toString()}`);

    console.log(crowdloans)
  })

  return "Hello World";
}

checkForNewCrowdloans().then(console.log)