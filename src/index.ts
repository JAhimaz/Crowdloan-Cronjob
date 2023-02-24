import { ApiPromise, WsProvider } from '@polkadot/api'
import { ref, set, get} from "firebase/database";
import * as dotenv from 'dotenv';
import md5 from 'md5'
import { Octokit } from 'octokit';
import { db } from './util/firebaseConfig';

async function checkForNewCrowdloans(): Promise<string> {

  dotenv.config();
  const octokit = new Octokit({ auth: process.env.TEST_SECRET });

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

  const paraIds = (await Promise.all(allParaIds)).flat();
  const hash = md5(paraIds.toString());

  // get hash from db
  const dbHash : string = await get(ref(db, 'hash')).then((snapshot) => {
    const data = snapshot.val();
    return data;
  });

  if(hash === dbHash) { return process.env.TEST_SECRET.toString(); }

  const dbParaIds : string = await get(ref(db, 'paraIds')).then((snapshot) => {
    const data = snapshot.val();
    return data;
  });

  // compare paraIds to dbParaIds and return the new ones
  const newParaIds = paraIds.filter((x: any) => !dbParaIds.includes(x));

  // Create a GitHub issue for each new paraId
  newParaIds.forEach((x: any) => {
    const [relayChainId, paraId] = x.split('-');
    const relayChain = Object.keys(relayChains).find(key => relayChains[key].id === Number(relayChainId));

    octokit.rest.issues.create({
      owner: 'JAhimaz',
      repo: 'Crowdloan-Cronjob',
      title: `[Crowdloan] New Crowdloan: ${paraId} on ${relayChain.toUpperCase()}`,
      body: `A new crowdloan has been detected on ${relayChain.toUpperCase()} with the paraId of ${paraId}`
    })
  })

  // Finally set the new Paraids
  set(ref(db, 'hash'), hash);
  set(ref(db, 'paraIds'), paraIds);

  return process.env.TEST_SECRET.toString();
}

checkForNewCrowdloans().then(console.log).then(() => process.exit(0)).catch(console.error);

