import * as _ from 'lodash'
import { DateTime } from 'luxon'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { Desktop, Display, exec2text, execIntoObject } from '..'

const MAC_DIR_PICTURES = 'Pictures'
const DIRNAME_APP = 'desktop-cctv'
const CMD_SCREENCAPTURE = 'screencapture'

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

    createOutputFilePath(display: Display): string {
        // ~/Pictures/desktop-cctv/2021/05/18/19_55_00-Color LCD.png
        const current = DateTime.now()
        // part after 'desktop-cctv'
        const lastPath = `${current.toFormat('yyyy/MM/dd/HH_mm_ss')}-${display.name}.png`
        const result = path.join(os.homedir(), MAC_DIR_PICTURES, DIRNAME_APP, lastPath)
        return result
    }

    captureTo(display: Display, outPath: string): void {
        // ensure the required directory
        const dir = path.dirname(outPath)
        !fs.existsSync(dir) && fs.mkdirSync(dir, { recursive: true })
        const cmdline = `${CMD_SCREENCAPTURE} -C -x -D${display.id} "${outPath}"`
        console.log(cmdline)
        exec2text(cmdline)
    }
}
