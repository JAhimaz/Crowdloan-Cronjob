import { ApiPromise, WsProvider } from '@polkadot/api'
import md5 from 'md5'

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

  const allParaIds = Object.values(relayChains).map(async (rpc : any) => {
    const api: any = await ApiPromise.create({ provider: new WsProvider(rpc?.rpc), noInitWarn: true });

    const paraIds = (await api.query.crowdloan?.funds.keys()).map((x: any) => Number(x.args[0])) ?? [];
    paraIds.sort((a: any, b: any) => a - b);

    const formatted = paraIds.map((x: any) => `${rpc.id}-${x}`) ?? [];

    return formatted;
  })

  const allParaIdsFlat = (await Promise.all(allParaIds)).flat();
  const hash = md5(allParaIdsFlat.toString());

  console.log(hash)

  return "Hello World";
}

checkForNewCrowdloans().then(console.log)