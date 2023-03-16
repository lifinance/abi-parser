import { red } from 'ansi-colors'
import superagent from 'superagent'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Throttle from 'superagent-throttle'

import { ChainConfig } from './chain-config'

const throttles = new Map<string, Throttle>()

const getThrottle = (chainConfig: ChainConfig): Throttle => {
    if (!throttles.has(chainConfig.apiHost)) {
        throttles.set(
            chainConfig.apiHost,
            new Throttle({
                active: true,
                rate: chainConfig.apiKey ? 5 : 1,
                ratePer: chainConfig.apiKey ? 1000 : 5000,
                concurrent: 1
            })
        )
    }

    return throttles.get(chainConfig.apiHost) as Throttle
}

export const getAbi = async (chainConfig: ChainConfig, address: string): Promise<string | undefined> => {
    const res = await superagent
        .get(`https://${chainConfig.apiHost}/api`)
        .use(getThrottle(chainConfig).plugin())
        .retry(5, (_, r) => r.status === 200 && r.body.result.startsWith('Max rate limit reached'))
        .query('module=contract')
        .query('action=getabi')
        .query(`address=${address}`)
        .query(chainConfig.apiKey ? `apiKey=${chainConfig.apiKey}` : {})

    if (res.body.message.startsWith('OK')) {
        console.log(`loaded abi for ${address}`)

        return res.body.result as string
    }
    console.log(
        red(`(${res.statusCode}) could not load abi for ${address} on ${chainConfig.chain}: ${res.body.message}`)
    )

    return undefined
}
