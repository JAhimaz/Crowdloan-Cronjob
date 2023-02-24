import { ApiPromise, WsProvider } from '@polkadot/api'
import { ref, set, get} from "firebase/database";
import md5 from 'md5'
import { Octokit } from 'octokit';
import { db } from './util/firebaseConfig';

async function checkForNewCrowdloans(): Promise<boolean> {

  const octokit = new Octokit({ auth: process.env.OCTOKIT_TOKEN });

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
  paraIds.push('0-5000'); // Add the default paraId
  const hash = md5(paraIds.toString());

  // get hash from db
  const dbHash : string = await get(ref(db, 'hash')).then((snapshot) => {
    const data = snapshot.val();
    return data;
  });

  if(hash === dbHash) { 
    console.log(`No new Crowdloans detected`);
    return false; 
  }

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

    console.log(`New Crowdloan: ${paraId} on ${relayChain.toUpperCase()}`);

    octokit.rest.issues.create({
      owner: 'JAhimaz',
      repo: 'Crowdloan-Cronjob',
      title: `[Crowdloan] New Crowdloan: ${paraId} on ${relayChain.toUpperCase()}`,
      body: `A new crowdloan has been detected on ${relayChain.toUpperCase()} with the paraId of ${paraId}`
    })
  })

  console.log(paraIds)

  // Finally set the new Paraids
  set(ref(db, 'hash'), hash);
  set(ref(db, 'paraIds'), paraIds);

  return true;
}

checkForNewCrowdloans().then(console.log).then(() => process.exit(0)).catch(console.error);

