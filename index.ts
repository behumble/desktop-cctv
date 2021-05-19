import os from 'os'
import { execSync } from 'child_process'
import MacDesktop from './lib/darwin'

const SUPPORTED_PLATFORMS = ['darwin']

function ensureSupportedPlatform() {
    const platform = os.platform()
    if(!SUPPORTED_PLATFORMS.includes(platform)) throw new Error('Unsupported platform')    
}

export interface Desktop {
    retrieveDisplays(): Display[]
    createOutputFilePath(display: Display): string
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

ensureSupportedPlatform()
const desktop = new MacDesktop()
const displays = desktop.retrieveDisplays()
displays.forEach(display => {
    const outPath = desktop.createOutputFilePath(display)
    desktop.captureTo(display, outPath)
})