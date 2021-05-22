import * as _ from 'lodash'
import { DateTime } from 'luxon'
import os from 'os'
import path from 'path'
import { Desktop, Display, exec2text, execIntoObject } from '..'

const MAC_DIR_PICTURES = 'Pictures'
const CMD_SCREENCAPTURE = 'screencapture'
const CMD_RESIZER = `sips`
const MAX_SIZE_RESIZER = 1680
export default class MacDesktop implements Desktop {
    retrieveDisplays(): Display[] {
        const dispInfo = execIntoObject('system_profiler SPDisplaysDataType -json')['SPDisplaysDataType']
        const validDisplayTypes = _.filter(dispInfo, elem => elem['spdisplays_ndrvs'])
        const result = _.flatMap(validDisplayTypes, dispType => dispType['spdisplays_ndrvs'])
        .map((ndrv, index) => {
            const id = String(index + 1)    // 'screencapture' uses 1-based display ID
            const widthHeight: string = ndrv['_spdisplays_pixels']
            const [width, height] = widthHeight.split('x').map(item => parseInt(item))
            return new Display(id, ndrv['_name'], width, height)
        })
        
        return result
    }

    getUserPicturesFolder(): string {
        return path.join(os.homedir(), MAC_DIR_PICTURES)
    }

    createOutputFilePath(cctvRoot:string, display:Display): string {
        // ~/Pictures/desktop-cctv/2021/05/18/19_55_00-Color LCD.png
        const current = DateTime.now()
        // part after 'desktop-cctv'
        const lastPath = `${current.toFormat('yyyy/MM/dd/HH_mm_ss')}-${display.name}.png`
        const result = path.join(cctvRoot, lastPath)
        return result
    }

    captureTo(display: Display, outPath: string): void {
        const cmdline = `${CMD_SCREENCAPTURE} -C -x -D${display.id} "${outPath}"`
        console.log(cmdline)
        exec2text(cmdline)
        console.log(exec2text(`${CMD_RESIZER} -Z ${MAX_SIZE_RESIZER} "${outPath}"`))
    }
}
