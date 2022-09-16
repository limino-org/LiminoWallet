
import { httpGet } from '../request'

const service = '/accountApi'
const apikey = 'freekey'

// Get transaction list
export function getTransitions(address: string  ){
    return httpGet(`${service}`, {
        address,
        module: 'account',
        action:'txlist',
        apikey
    })
}