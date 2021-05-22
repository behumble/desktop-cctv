import fs from 'fs'
import os from 'os'
import path from 'path'
import { execSync } from 'child_process'
import MacDesktop from './lib/darwin'

const DIRNAME_APP = 'desktop-cctv'
const SUPPORTED_PLATFORMS = ['darwin']
const OLD_DIR_IN_DAYS = 1

function ensureSupportedPlatform() {
    const platform = os.platform()
    if(!SUPPORTED_PLATFORMS.includes(platform)) throw new Error('Unsupported platform')    
}

export interface Desktop {
    retrieveDisplays(): Display[]
    getUserPicturesFolder(): string
    createOutputFilePath(cctvRoot:string, display:Display): string
    captureTo(display:Display, outPath:string): void
}

export class Display {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly width: number,
        public readonly height: number
    ) {}
}

export function exec2text(cmd: string) {
    return execSync(cmd, {
        encoding: 'utf-8'
    })
}

// system_profiler SPDisplaysDataType -json
export function execIntoObject(cmd: string) {
    const jsonText = exec2text(cmd)
    return JSON.parse(jsonText)
}

export function ensureOutputDirExists(dir: string) {
    // ensure the directory exists
    !fs.existsSync(dir) && fs.mkdirSync(dir, { recursive: true })
}

ensureSupportedPlatform()
const desktop = new MacDesktop()    // hard-coded currently
const cctvRoot = `${desktop.getUserPicturesFolder()}/${DIRNAME_APP}`
handleOldFolders(cctvRoot, new Date().getTime())

const displays = desktop.retrieveDisplays()
displays.forEach(display => {
    const outPath = desktop.createOutputFilePath(cctvRoot, display)
    // ensure the required directory
    const dir = path.dirname(outPath)
    ensureOutputDirExists(dir)
    desktop.captureTo(display, outPath)
})

function findLeafDirs(parent: string):string[] {
    let result:string[] = []
    const children = fs.readdirSync(parent)
    let hasDir = false
    children.forEach(child => {
        const path = `${parent}/${child}`
        const stat = fs.statSync(path)
        if(stat.isDirectory()) {
            hasDir = true
            result = result.concat(findLeafDirs(path))
        }
    })
    if(!hasDir) result.push(parent)
    return result
}

function handleOldFolders(cctvRoot: string, currentMs: number) {
    // find leaf dirs which considered old
    const dirsToRemove = findLeafDirs(cctvRoot)
    dirsToRemove.forEach(leafDir => {
        const stat = fs.statSync(leafDir)
        const diff = currentMs - stat.mtimeMs
        const old = diff > OLD_DIR_IN_DAYS * 24 * 60  * 60 * 1000
        if(old) {
            console.log('Deleting old directory', leafDir)
            console.log(`BEFORE ---`)
            console.log(exec2text('df -h'))
            execSync(`rm -rf ${leafDir}`)
            console.log(`AFTER ---`)
            console.log(exec2text('df -h'))
        }
    })
}
